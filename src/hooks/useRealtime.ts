import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeBall {
  id: string;
  match_id: string;
  over_number: number;
  ball_number: number;
  runs: number;
  batsman_id: string;
  bowler_id: string;
  wicket?: boolean;
  dismissal_type?: string;
  dismissal_player?: string;
  notes?: string;
  recorded_at: string;
  [key: string]: any;
}

export interface RealtimeCallbacks {
  onInsert?: (ball: RealtimeBall) => void;
  onUpdate?: (ball: RealtimeBall) => void;
  onDelete?: (ball: RealtimeBall) => void;
}

/**
 * Hook to subscribe to realtime ball updates
 * Listens to INSERT, UPDATE, DELETE events on the 'balls' table
 */
export function useBallsRealtime(matchId: string | undefined, callbacks?: RealtimeCallbacks) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<RealtimeBall | null>(null);

  useEffect(() => {
    if (!matchId) return;

    let channel: RealtimeChannel | null = null;
    let unsubscribed = false;

    const setupSubscription = async () => {
      try {
        // Create a channel for this specific match
        channel = supabase.channel(`match:${matchId}:balls`, {
          config: {
            broadcast: { self: true },
          },
        });

        // Listen for INSERT events on balls table
        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'balls',
              filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const newBall = payload.new as RealtimeBall;
                setLastUpdate(newBall);
                callbacks?.onInsert?.(newBall);
                console.log('New ball recorded:', newBall);
              }
            }
          )
          // Listen for UPDATE events
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'balls',
              filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const updatedBall = payload.new as RealtimeBall;
                setLastUpdate(updatedBall);
                callbacks?.onUpdate?.(updatedBall);
                console.log('Ball updated:', updatedBall);
              }
            }
          )
          // Listen for DELETE events
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'balls',
              filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const deletedBall = payload.old as RealtimeBall;
                setLastUpdate(deletedBall);
                callbacks?.onDelete?.(deletedBall);
                console.log('Ball deleted:', deletedBall);
              }
            }
          )
          .subscribe(async (status) => {
            if (!unsubscribed) {
              console.log('Realtime subscription status:', status);
              setIsConnected(status === 'SUBSCRIBED');
              setError(status === 'SUBSCRIBED' ? null : 'Connection lost');
            }
          });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to setup realtime';
        console.error('Realtime error:', errorMessage);
        if (!unsubscribed) {
          setError(errorMessage);
        }
      }
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      unsubscribed = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, callbacks]);

  return {
    isConnected,
    error,
    lastUpdate,
  };
}

/**
 * Hook to subscribe to realtime match updates
 */
export function useMatchRealtime(matchId: string | undefined, callbacks?: RealtimeCallbacks) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    if (!matchId) return;

    let channel: RealtimeChannel | null = null;
    let unsubscribed = false;

    const setupSubscription = async () => {
      try {
        channel = supabase.channel(`match:${matchId}`, {
          config: {
            broadcast: { self: true },
          },
        });

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'matches',
              filter: `id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const updatedMatch = payload.new as RealtimeBall;
                setLastUpdate(updatedMatch);
                if (payload.eventType === 'INSERT') {
                  callbacks?.onInsert?.(updatedMatch as RealtimeBall);
                } else if (payload.eventType === 'UPDATE') {
                  callbacks?.onUpdate?.(updatedMatch as RealtimeBall);
                } else if (payload.eventType === 'DELETE') {
                  callbacks?.onDelete?.(updatedMatch as RealtimeBall);
                }
                console.log('Match updated:', updatedMatch);
              }
            }
          )
          .subscribe(async (status) => {
            if (!unsubscribed) {
              console.log('Match realtime status:', status);
              setIsConnected(status === 'SUBSCRIBED');
              setError(status === 'SUBSCRIBED' ? null : 'Connection lost');
            }
          });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to setup realtime';
        console.error('Match realtime error:', errorMessage);
        if (!unsubscribed) {
          setError(errorMessage);
        }
      }
    };

    setupSubscription();

    return () => {
      unsubscribed = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, callbacks]);

  return {
    isConnected,
    error,
    lastUpdate,
  };
}

/**
 * Hook to subscribe to realtime batting/bowling stats updates
 */
export function useStatsRealtime(matchId: string | undefined, callbacks?: RealtimeCallbacks) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    if (!matchId) return;

    let battingChannel: RealtimeChannel | null = null;
    let bowlingChannel: RealtimeChannel | null = null;
    let unsubscribed = false;

    const setupSubscriptions = async () => {
      try {
        // Batting stats subscription
        battingChannel = supabase.channel(`match:${matchId}:batting`, {
          config: { broadcast: { self: true } },
        });

        battingChannel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'batting_entries',
              filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const stat = payload.new as unknown as RealtimeBall;
                setLastUpdate(stat);
                callbacks?.onUpdate?.(stat);
              }
            }
          )
          .subscribe();

        // Bowling stats subscription
        bowlingChannel = supabase.channel(`match:${matchId}:bowling`, {
          config: { broadcast: { self: true } },
        });

        bowlingChannel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bowling_entries',
              filter: `match_id=eq.${matchId}`,
            },
            (payload) => {
              if (!unsubscribed) {
                const stat = payload.new as unknown as RealtimeBall;
                setLastUpdate(stat);
                callbacks?.onUpdate?.(stat);
              }
            }
          )
          .subscribe(async (status) => {
            if (!unsubscribed) {
              setIsConnected(status === 'SUBSCRIBED');
              setError(status === 'SUBSCRIBED' ? null : 'Connection lost');
            }
          });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to setup realtime';
        console.error('Stats realtime error:', errorMessage);
        if (!unsubscribed) {
          setError(errorMessage);
        }
      }
    };

    setupSubscriptions();

    return () => {
      unsubscribed = true;
      if (battingChannel) supabase.removeChannel(battingChannel);
      if (bowlingChannel) supabase.removeChannel(bowlingChannel);
    };
  }, [matchId, callbacks]);

  return {
    isConnected,
    error,
    lastUpdate,
  };
}
