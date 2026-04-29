import { MatchPlayer } from "@/types/cricket";
import { supabase } from "./supabase";

interface MatchPlayerRow {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  role?: string | null;
}

function hasRoleFlag(role: string | null | undefined, flag: string) {
  return (role || "").split(",").map((item) => item.trim()).includes(flag);
}

function setRoleFlag(role: string | null | undefined, flag: string, enabled: boolean) {
  const flags = new Set((role || "").split(",").map((item) => item.trim()).filter(Boolean));
  if (enabled) {
    flags.add(flag);
  } else {
    flags.delete(flag);
  }
  return Array.from(flags).join(",");
}

export async function fetchMatchPlayers(
  matchId: string,
  teamAId?: string,
  teamBId?: string
): Promise<{ data: MatchPlayer[]; error: string | null }> {
  if (!matchId) return { data: [], error: null };

  const { data, error } = await supabase
    .from("match_players")
    .select("id, match_id, player_id, team_id, role")
    .eq("match_id", matchId);

  if (error) {
    return { data: [], error: error.message || "Failed to fetch match players" };
  }

  const players = ((data as MatchPlayerRow[]) || []).map((row) => ({
    id: row.id,
    matchId: row.match_id,
    playerId: row.player_id,
    team: row.team_id === teamBId ? "B" : "A",
    isCaptain: hasRoleFlag(row.role, "captain"),
    isWicketKeeper: hasRoleFlag(row.role, "wicketkeeper"),
  })) as MatchPlayer[];

  return {
    data: players.filter((player) => teamAId || teamBId),
    error: null,
  };
}

export async function addMatchPlayer(
  matchId: string,
  playerId: string,
  teamId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("match_players")
    .insert([{ match_id: matchId, player_id: playerId, team_id: teamId }]);

  return { error: error ? error.message || "Failed to assign player" : null };
}

export async function updateMatchPlayerTeam(
  assignmentId: string,
  teamId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("match_players")
    .update({ team_id: teamId })
    .eq("id", assignmentId);

  return { error: error ? error.message || "Failed to update player team" : null };
}

export async function updateMatchPlayerRoleFlags(
  assignmentId: string,
  current: MatchPlayer,
  flag: "captain" | "wicketkeeper",
  enabled: boolean
): Promise<{ error: string | null }> {
  const currentRole = [
    current.isCaptain ? "captain" : "",
    current.isWicketKeeper ? "wicketkeeper" : "",
  ]
    .filter(Boolean)
    .join(",");

  const { error } = await supabase
    .from("match_players")
    .update({ role: setRoleFlag(currentRole, flag, enabled) })
    .eq("id", assignmentId);

  return { error: error ? error.message || "Failed to update player role" : null };
}

export async function deleteMatchPlayer(assignmentId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("match_players").delete().eq("id", assignmentId);
  return { error: error ? error.message || "Failed to remove player" : null };
}
