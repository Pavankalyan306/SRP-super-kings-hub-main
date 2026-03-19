import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
  getTeamRoster,
  addPlayerToTeam,
  removePlayerFromTeam,
  Team,
  TeamStats,
} from '@/lib/teams';

/**
 * Fetch all teams with React Query
 * Returns loading, error, and data states automatically
 */
export function useTeams(): UseQueryResult<Team[], Error> {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetchTeams();
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
 * Fetch a single team by ID
 */
export function useTeam(teamId: string | undefined): UseQueryResult<Team | null, Error> {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const response = await fetchTeamById(teamId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.[0] || null;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Create a new team mutation
 * Automatically updates the teams cache
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => createTeam(teamData),
    onSuccess: (response) => {
      if (!response.error) {
        // Invalidate teams queries to refetch
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      }
    },
    onError: (error) => {
      console.error('Create team error:', error);
    },
  });
}

/**
 * Update a team mutation
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, updates }: { teamId: string; updates: Partial<Team> }) =>
      updateTeam(teamId, updates),
    onSuccess: (response, { teamId }) => {
      if (!response.error) {
        // Invalidate specific team and all teams
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      }
    },
    onError: (error) => {
      console.error('Update team error:', error);
    },
  });
}

/**
 * Delete a team mutation
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: (response, teamId) => {
      if (response.success) {
        // Invalidate teams queries
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      }
    },
    onError: (error) => {
      console.error('Delete team error:', error);
    },
  });
}

/**
 * Fetch team statistics
 */
export function useTeamStats(teamId: string | undefined): UseQueryResult<TeamStats | null, Error> {
  return useQuery({
    queryKey: ['team-stats', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const response = await getTeamStats(teamId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch team roster (all players in the team)
 */
export function useTeamRoster(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-roster', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const response = await getTeamRoster(teamId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Add player to team mutation
 */
export function useAddPlayerToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerId, jerseyNumber, role }: {
      teamId: string;
      playerId: string;
      jerseyNumber?: number;
      role?: string;
    }) => addPlayerToTeam(teamId, playerId, jerseyNumber, role),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        // Invalidate team roster
        queryClient.invalidateQueries({ queryKey: ['team-roster', teamId] });
      }
    },
    onError: (error) => {
      console.error('Add player to team error:', error);
    },
  });
}

/**
 * Remove player from team mutation
 */
export function useRemovePlayerFromTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      removePlayerFromTeam(teamId, playerId),
    onSuccess: (response, { teamId }) => {
      if (response.success) {
        // Invalidate team roster
        queryClient.invalidateQueries({ queryKey: ['team-roster', teamId] });
      }
    },
    onError: (error) => {
      console.error('Remove player from team error:', error);
    },
  });
}
