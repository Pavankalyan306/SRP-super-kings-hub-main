import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  fetchPlayers,
  fetchPlayerById,
  fetchPlayersByRole,
  createPlayer,
  updatePlayer,
  deletePlayer,
  bulkUpdatePlayers,
  getPlayerStats,
  PlayerStats,
} from '@/lib/players';
import { Player } from '@/types/cricket';

/**
 * Fetch all players with React Query
 * Returns loading, error, and data states automatically
 */
export function usePlayers(): UseQueryResult<Player[], Error> {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const response = await fetchPlayers();
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
 * Fetch a single player by ID
 */
export function usePlayer(playerId: string | undefined): UseQueryResult<Player | null, Error> {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await fetchPlayerById(playerId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.[0] || null;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch players by role
 */
export function usePlayersByRole(role: string | undefined): UseQueryResult<Player[], Error> {
  return useQuery({
    queryKey: ['players', 'role', role],
    queryFn: async () => {
      if (!role) return [];
      const response = await fetchPlayersByRole(role);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!role,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Create a new player mutation
 * Automatically updates the players cache
 */
export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerData: Omit<Player, 'id'>) => createPlayer(playerData),
    onSuccess: (response) => {
      if (!response.error) {
        // Invalidate players queries to refetch
        queryClient.invalidateQueries({ queryKey: ['players'] });
      }
    },
    onError: (error) => {
      console.error('Create player error:', error);
    },
  });
}

/**
 * Update a player mutation
 */
export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, updates }: { playerId: string; updates: Partial<Player> }) =>
      updatePlayer(playerId, updates),
    onSuccess: (response, { playerId }) => {
      if (!response.error) {
        // Invalidate specific player and all players
        queryClient.invalidateQueries({ queryKey: ['player', playerId] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
      }
    },
    onError: (error) => {
      console.error('Update player error:', error);
    },
  });
}

/**
 * Delete a player mutation
 */
export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => deletePlayer(playerId),
    onSuccess: (response, playerId) => {
      if (response.success) {
        // Invalidate players queries
        queryClient.invalidateQueries({ queryKey: ['player', playerId] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
      }
    },
    onError: (error) => {
      console.error('Delete player error:', error);
    },
  });
}

/**
 * Bulk update players mutation
 */
export function useBulkUpdatePlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (players: Player[]) => bulkUpdatePlayers(players),
    onSuccess: (response) => {
      if (!response.error) {
        queryClient.invalidateQueries({ queryKey: ['players'] });
      }
    },
    onError: (error) => {
      console.error('Bulk update players error:', error);
    },
  });
}

/**
 * Fetch player statistics
 */
export function usePlayerStats(playerId: string | undefined): UseQueryResult<PlayerStats | null, Error> {
  return useQuery({
    queryKey: ['player-stats', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await getPlayerStats(playerId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 10, // 10 minutes (stats don't change often)
    gcTime: 1000 * 60 * 30,
  });
}
