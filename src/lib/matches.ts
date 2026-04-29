import { supabase } from "./supabase";
import { Match } from "@/types/cricket";

export interface FetchMatchesResponse {
  data: Match[] | null;
  error: string | null;
  isLoading: boolean;
}

const statusToUi = (status?: string): Match["status"] => {
  if (status === "live") return "live";
  if (status === "completed") return "completed";
  return "upcoming";
};

const statusToDb = (status?: Match["status"]): string => {
  if (status === "live") return "live";
  if (status === "completed") return "completed";
  return "scheduled";
};

const mapDateOnly = (value?: string | null): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

const mapMatchRow = (row: any): Match => ({
  id: row.id,
  teamAId: row.team1_id,
  teamBId: row.team2_id,
  teamA: row.team1?.name || "Team A",
  teamB: row.team2?.name || "Team B",
  date: mapDateOnly(row.match_date),
  status: statusToUi(row.status),
  venue: row.venue || "",
  scoreA: row.score_a || "",
  scoreB: row.score_b || "",
  oversA: row.overs_a || "",
  oversB: row.overs_b || "",
  result: row.result || "",
  liveScoring: Boolean(row.live_scoring),
  currentInnings: row.current_innings || undefined,
  striker: row.striker_id || undefined,
  nonStriker: row.non_striker_id || undefined,
  currentBowler: row.current_bowler_id || undefined,
  lastBowler: row.last_bowler_id || undefined,
  outBatsmen: row.out_batsmen || [],
  totalOvers: row.total_overs || row.overs_per_side || 20,
  tossWinner: row.toss_winner || undefined,
  tossDecision: row.toss_decision || undefined,
  tossCompleted: Boolean(row.toss_completed),
  inningsATeam: row.innings_a_team || undefined,
  inningsBTeam: row.innings_b_team || undefined,
});

async function ensureTeam(name: string): Promise<string> {
  const trimmed = name.trim();
  const { data: existing, error: fetchErr } = await supabase
    .from("teams")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertErr } = await supabase
    .from("teams")
    .insert([{ name: trimmed }])
    .select("id")
    .single();

  if (insertErr || !inserted) throw new Error(insertErr?.message || "Failed to create team");
  return inserted.id;
}

export async function fetchMatches(): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)");

    if (error) {
      return { data: null, error: error.message || "Failed to fetch matches", isLoading: false };
    }

    return { data: ((data as any[]) || []).map(mapMatchRow), error: null, isLoading: false };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { data: null, error: errorMessage, isLoading: false };
  }
}

export async function fetchMatchById(matchId: string): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)")
      .eq("id", matchId)
      .single();

    if (error) {
      return { data: null, error: error.message || `Failed to fetch match ${matchId}`, isLoading: false };
    }

    return { data: data ? [mapMatchRow(data)] : null, error: null, isLoading: false };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { data: null, error: errorMessage, isLoading: false };
  }
}

export async function fetchMatchesByStatus(status: Match["status"]): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)")
      .eq("status", statusToDb(status));

    if (error) {
      return { data: null, error: error.message || `Failed to fetch ${status} matches`, isLoading: false };
    }

    return { data: ((data as any[]) || []).map(mapMatchRow), error: null, isLoading: false };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { data: null, error: errorMessage, isLoading: false };
  }
}

export async function createMatch(matchData: Omit<Match, "id">): Promise<FetchMatchesResponse> {
  try {
    const team1_id = await ensureTeam(matchData.teamA);
    const team2_id = await ensureTeam(matchData.teamB);

    const payload = {
      team1_id,
      team2_id,
      match_date: matchData.date || new Date().toISOString(),
      venue: matchData.venue || "",
      status: statusToDb(matchData.status),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("matches").insert([payload]).select("id").single();
    if (error || !data?.id) {
      return { data: null, error: error?.message || "Failed to create match", isLoading: false };
    }
    return fetchMatchById(data.id);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { data: null, error: errorMessage, isLoading: false };
  }
}

export async function updateMatch(matchId: string, updates: Partial<Match>): Promise<FetchMatchesResponse> {
  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.teamA !== undefined) dbUpdates.team1_id = await ensureTeam(updates.teamA);
    if (updates.teamB !== undefined) dbUpdates.team2_id = await ensureTeam(updates.teamB);
    if (updates.date !== undefined) dbUpdates.match_date = updates.date;
    if (updates.venue !== undefined) dbUpdates.venue = updates.venue;
    if (updates.status !== undefined) dbUpdates.status = statusToDb(updates.status);
    if (updates.scoreA !== undefined) dbUpdates.score_a = updates.scoreA;
    if (updates.scoreB !== undefined) dbUpdates.score_b = updates.scoreB;
    if (updates.oversA !== undefined) dbUpdates.overs_a = updates.oversA;
    if (updates.oversB !== undefined) dbUpdates.overs_b = updates.oversB;
    if (updates.result !== undefined) dbUpdates.result = updates.result;
    if (updates.liveScoring !== undefined) dbUpdates.live_scoring = updates.liveScoring;
    if (updates.currentInnings !== undefined) dbUpdates.current_innings = updates.currentInnings;
    if ("striker" in updates) dbUpdates.striker_id = updates.striker || null;
    if ("nonStriker" in updates) dbUpdates.non_striker_id = updates.nonStriker || null;
    if ("currentBowler" in updates) dbUpdates.current_bowler_id = updates.currentBowler || null;
    if ("lastBowler" in updates) dbUpdates.last_bowler_id = updates.lastBowler || null;
    if (updates.outBatsmen !== undefined) dbUpdates.out_batsmen = updates.outBatsmen;
    if (updates.totalOvers !== undefined) {
      dbUpdates.total_overs = updates.totalOvers;
      dbUpdates.overs_per_side = updates.totalOvers;
    }
    if (updates.tossWinner !== undefined) dbUpdates.toss_winner = updates.tossWinner;
    if (updates.tossDecision !== undefined) dbUpdates.toss_decision = updates.tossDecision;
    if (updates.tossCompleted !== undefined) dbUpdates.toss_completed = updates.tossCompleted;
    if (updates.inningsATeam !== undefined) dbUpdates.innings_a_team = updates.inningsATeam;
    if (updates.inningsBTeam !== undefined) dbUpdates.innings_b_team = updates.inningsBTeam;

    const { data: updatedRows, error } = await supabase
      .from("matches")
      .update(dbUpdates)
      .eq("id", matchId)
      .select("id");
    if (error) {
      return { data: null, error: error.message || `Failed to update match ${matchId}`, isLoading: false };
    }
    if (!updatedRows || updatedRows.length === 0) {
      return { data: null, error: "Match update was blocked by database permissions or the match no longer exists.", isLoading: false };
    }
    return fetchMatchById(matchId);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { data: null, error: errorMessage, isLoading: false };
  }
}

export async function deleteMatch(matchId: string): Promise<{ error: string | null }> {
  try {
    const relatedTables = ["balls", "batting_entries", "bowling_entries", "match_players", "photos"];

    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq("match_id", matchId);
      if (error) {
        return { error: error.message || `Failed to delete ${table} for match ${matchId}` };
      }
    }

    const { data: deletedRows, error } = await supabase.from("matches").delete().eq("id", matchId).select("id");
    if (!error && (!deletedRows || deletedRows.length === 0)) {
      return { error: "Match delete was blocked by database permissions or the match no longer exists." };
    }
    return { error: error ? error.message || `Failed to delete match ${matchId}` : null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { error: errorMessage };
  }
}

export interface InsertMatchData {
  team1_id: string;
  team2_id: string;
  status: "upcoming" | "live" | "completed";
  match_date: string;
  venue?: string;
  [key: string]: any;
}

export interface InsertMatchResponse {
  success: boolean;
  message: string;
  data?: Match;
  error?: string;
}

export async function insertMatch(matchData: InsertMatchData): Promise<InsertMatchResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return {
        success: false,
        message: "Authentication required to insert a match",
        error: "User is not authenticated. Please log in to create a match.",
      };
    }

    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          team1_id: matchData.team1_id,
          team2_id: matchData.team2_id,
          status: statusToDb(matchData.status),
          match_date: matchData.match_date,
          venue: matchData.venue || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (error || !data?.id) {
      return {
        success: false,
        message: "Failed to insert match",
        error: error?.message || "Database error occurred while inserting the match",
      };
    }

    const fetched = await fetchMatchById(data.id);
    return {
      success: true,
      message: "Match created successfully",
      data: fetched.data?.[0],
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}
