import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  insertBall,
  insertBalls,
  fetchBallsByOver,
  fetchBallsByMatch,
  fetchLiveBallsByMatch,
  addLiveBall,
  deleteLiveBall,
  BallData,
  InsertBallResponse,
} from '@/lib/balls';
import { BallData as UiBallData } from '@/types/cricket';

/**
 * Insert a single ball record
 * Automatically refetches match data after insertion
 */
export function useInsertBall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertBall,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const matchId = response.data.match_id;

        // Invalidate match-related queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['matches', matchId] });
        queryClient.invalidateQueries({ queryKey: ['balls', matchId] });
        queryClient.invalidateQueries({ queryKey: ['balls', matchId, 'all'] });
      }
    },
    onError: (error) => {
      console.error('Failed to insert ball:', error);
    },
  });
}

/**
 * Insert multiple balls in batch
 * Automatically refetches match data after insertion
 */
export function useInsertBalls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertBalls,
    onSuccess: (response) => {
      if (response.success && response.data && response.data.length > 0) {
        const matchId = response.data[0].match_id;

        // Invalidate all ball and match related queries
        queryClient.invalidateQueries({ queryKey: ['matches', matchId] });
        queryClient.invalidateQueries({ queryKey: ['balls', matchId] });
        queryClient.invalidateQueries({ queryKey: ['balls', matchId, 'all'] });
      }
    },
    onError: (error) => {
      console.error('Failed to insert balls:', error);
    },
  });
}

/**
 * Fetch balls for a specific over
 */
export function useBallsByOver(
  matchId: string | undefined,
  overNumber: number
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['balls', matchId, 'over', overNumber],
    queryFn: async () => {
      if (!matchId) return [];
      const response = await fetchBallsByOver(matchId, overNumber);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!matchId,
    staleTime: 1000 * 10, // 10 seconds - live data
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch all balls for a match
 */
export function useBallsByMatch(
  matchId: string | undefined
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['balls', matchId, 'all'],
    queryFn: async () => {
      if (!matchId) return [];
      const response = await fetchBallsByMatch(matchId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!matchId,
    staleTime: 1000 * 10, // 10 seconds - live data
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 5, // Auto-refetch every 5 seconds during live match
  });
}

export function useLiveBallsByMatch(matchId: string | undefined): UseQueryResult<UiBallData[], Error> {
  return useQuery({
    queryKey: ['live-balls', matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const response = await fetchLiveBallsByMatch(matchId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!matchId,
    staleTime: 1000 * 5,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 5,
  });
}

export function useAddLiveBall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLiveBall,
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['live-balls', response.data.matchId] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
  });
}

export function useDeleteLiveBall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, ballId }: { matchId: string; ballId: string }) => deleteLiveBall(ballId),
    onSuccess: (_response, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['live-balls', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
