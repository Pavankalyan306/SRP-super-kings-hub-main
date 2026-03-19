import { supabase } from './supabase';
import { Player } from '@/types/cricket';

export interface FetchPlayersResponse {
  data: Player[] | null;
  error: string | null;
  isLoading: boolean;
}

export interface PlayerStats {
  id: string;
  name: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  strikeRate: number;
}

/**
 * Fetch all players from Supabase
 */
export async function fetchPlayers(): Promise<FetchPlayersResponse> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch players',
        isLoading: false,
      };
    }

    return {
      data: data as Player[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error fetching players:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Fetch a single player by ID
 */
export async function fetchPlayerById(playerId: string): Promise<FetchPlayersResponse> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return {
        data: null,
        error: error.message || `Failed to fetch player ${playerId}`,
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Player] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching player ${playerId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Fetch players by role
 */
export async function fetchPlayersByRole(role: string): Promise<FetchPlayersResponse> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('role', role)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Error fetching ${role} players:`, error);
      return {
        data: null,
        error: error.message || `Failed to fetch ${role} players`,
        isLoading: false,
      };
    }

    return {
      data: data as Player[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching ${role} players:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Create a new player (admin only)
 */
export async function createPlayer(playerData: Omit<Player, 'id'>): Promise<FetchPlayersResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        data: null,
        error: 'Authentication required',
        isLoading: false,
      };
    }

    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      return {
        data: null,
        error: error.message || 'Failed to create player',
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Player] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error creating player:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Update a player (admin only)
 */
export async function updatePlayer(
  playerId: string,
  updates: Partial<Player>
): Promise<FetchPlayersResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        data: null,
        error: 'Authentication required',
        isLoading: false,
      };
    }

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating player ${playerId}:`, error);
      return {
        data: null,
        error: error.message || 'Failed to update player',
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Player] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error updating player ${playerId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Delete a player (admin only)
 */
export async function deletePlayer(playerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error(`Error deleting player ${playerId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete player',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error deleting player ${playerId}:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Bulk update players (admin only)
 */
export async function bulkUpdatePlayers(players: Player[]): Promise<FetchPlayersResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        data: null,
        error: 'Authentication required',
        isLoading: false,
      };
    }

    const { data, error } = await supabase
      .from('players')
      .upsert(players, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error bulk updating players:', error);
      return {
        data: null,
        error: error.message || 'Failed to bulk update players',
        isLoading: false,
      };
    }

    return {
      data: data as Player[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error bulk updating players:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Get player statistics with aggregated data
 */
export async function getPlayerStats(playerId: string): Promise<{
  data: PlayerStats | null;
  error: string | null;
}> {
  try {
    // Fetch player basic info
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('id, name, role')
      .eq('id', playerId)
      .single();

    if (playerError || !playerData) {
      return {
        data: null,
        error: playerError?.message || 'Player not found',
      };
    }

    // Fetch batting data
    const { data: battingData } = await supabase
      .from('balls')
      .select('runs')
      .eq('batter_id', playerId);

    // Fetch bowling data
    const { data: bowlingData } = await supabase
      .from('balls')
      .select('wicket')
      .eq('bowler_id', playerId)
      .eq('wicket', true);

    // Fetch match count
    const { data: matchData } = await supabase
      .from('match_players')
      .select('id')
      .eq('player_id', playerId);

    const runs = battingData?.reduce((sum, ball) => sum + (parseInt(ball.runs) || 0), 0) || 0;
    const wickets = bowlingData?.length || 0;
    const matches = matchData?.length || 0;
    const strikeRate = battingData?.length ? (runs / battingData.length) * 100 : 0;

    return {
      data: {
        id: playerId,
        name: playerData.name,
        role: playerData.role,
        matches,
        runs,
        wickets,
        strikeRate: Math.round(strikeRate * 100) / 100,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching stats for player ${playerId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
    };
  }
}
