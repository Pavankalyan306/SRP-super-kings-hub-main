import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  fetchMatches,
  fetchMatchById,
  fetchMatchesByStatus,
  createMatch,
  updateMatch,
  deleteMatch,
  insertMatch,
  InsertMatchData,
  InsertMatchResponse,
} from '@/lib/matches';
import { Match } from '@/types/cricket';

/**
 * Fetch all matches with React Query
 * Returns loading, error, and data states automatically
 */
export function useMatches(): UseQueryResult<Match[], Error> {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await fetchMatches();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch a single match by ID
 */
export function useMatch(matchId: string | undefined): UseQueryResult<Match | null, Error> {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const response = await fetchMatchById(matchId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.[0] || null;
    },
    enabled: !!matchId, // Only run query if matchId is provided
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch matches by status (upcoming, live, completed)
 */
export function useMatchesByStatus(status: 'upcoming' | 'live' | 'completed') {
  return useQuery({
    queryKey: ['matches', 'status', status],
    queryFn: async () => {
      const response = await fetchMatchesByStatus(status);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Create a new match mutation
 * Automatically updates the matches cache
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchData: Omit<Match, 'id'>) => {
      const response = await createMatch(matchData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.[0];
    },
    onSuccess: () => {
      // Invalidate and refetch matches
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.error('Failed to create match:', error);
    },
  });
}

/**
 * Update a match mutation
 * Automatically updates the matches cache
 */
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, updates }: { matchId: string; updates: Partial<Match> }) => {
      const response = await updateMatch(matchId, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.[0];
    },
    onSuccess: (data) => {
      if (data) {
        // Update the specific match in cache
        queryClient.setQueryData(['matches', data.id], data);
      }
      // Invalidate matches list
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.error('Failed to update match:', error);
    },
  });
}

/**
 * Delete a match mutation
 * Automatically updates the matches cache
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await deleteMatch(matchId);
      if (response.error) {
        throw new Error(response.error);
      }
      return matchId;
    },
    onSuccess: (deletedMatchId) => {
      // Remove from cache
      queryClient.setQueryData(
        ['matches', deletedMatchId],
        null
      );
      // Invalidate matches list
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.error('Failed to delete match:', error);
    },
  });
}

/**
 * Insert a new match (requires authentication)
 * Includes success/error message handling
 * Automatically updates the matches cache
 */
export function useInsertMatch() {
  const queryClient = useQueryClient();

  return useMutation<InsertMatchResponse, Error, InsertMatchData>({
    mutationFn: insertMatch,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Add to cache
        queryClient.setQueryData(['matches', response.data.id], response.data);
        // Invalidate matches list to refetch
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
    onError: (error) => {
      console.error('Failed to insert match:', error);
    },
  });
}
