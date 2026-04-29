import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MatchPlayer } from "@/types/cricket";
import {
  addMatchPlayer,
  deleteMatchPlayer,
  fetchMatchPlayers,
  updateMatchPlayerRoleFlags,
  updateMatchPlayerTeam,
} from "@/lib/matchPlayers";

export function useMatchPlayers(matchId: string, teamAId?: string, teamBId?: string) {
  return useQuery({
    queryKey: ["match-players", matchId],
    queryFn: async () => {
      const response = await fetchMatchPlayers(matchId, teamAId, teamBId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: Boolean(matchId && teamAId && teamBId),
    staleTime: 1000 * 60,
  });
}

export function useAddMatchPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, playerId, teamId }: { matchId: string; playerId: string; teamId: string }) =>
      addMatchPlayer(matchId, playerId, teamId),
    onSuccess: (_response, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match-players", matchId] });
    },
  });
}

export function useUpdateMatchPlayerTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, assignmentId, teamId }: { matchId: string; assignmentId: string; teamId: string }) =>
      updateMatchPlayerTeam(assignmentId, teamId),
    onSuccess: (_response, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match-players", matchId] });
    },
  });
}

export function useUpdateMatchPlayerRoleFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      assignmentId,
      current,
      flag,
      enabled,
    }: {
      matchId: string;
      assignmentId: string;
      current: MatchPlayer;
      flag: "captain" | "wicketkeeper";
      enabled: boolean;
    }) => updateMatchPlayerRoleFlags(assignmentId, current, flag, enabled),
    onSuccess: (_response, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match-players", matchId] });
    },
  });
}

export function useDeleteMatchPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, assignmentId }: { matchId: string; assignmentId: string }) =>
      deleteMatchPlayer(assignmentId),
    onSuccess: (_response, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["match-players", matchId] });
    },
  });
}
