import PlayerCard from "@/components/PlayerCard";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Player } from "@/types/cricket";
import { usePlayers } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";
import { useBallsByMatch } from "@/hooks/useBalls";
import { useData } from "@/context/DataContext";

/** Derive all player stats from ball-by-ball data across every match */
function useComputedPlayers() {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { matchPlayers } = useData();
  
  // Fetch balls for each match (in-memory fallback for now)
  const { balls: localBalls } = useData();

  return useMemo(() => {
    // If still loading or no data, return empty
    if (playersLoading || matchesLoading || !players || players.length === 0) {
      return players || [];
    }

    // If no matches exist, all stats are zero
    const validMatchIds = new Set(matches.map((m) => m.id));
    const validBalls = localBalls.filter((b) => validMatchIds.has(b.matchId));

    return players.map((p): Player => {
      if (matches.length === 0) {
        return { ...p, runs: 0, wickets: 0, matches: 0, strikeRate: 0 };
      }

      // --- batting ---
      const batterBalls = validBalls.filter((b) => b.batter === p.id);
      let runs = 0, ballsFaced = 0, fours = 0, sixes = 0;
      batterBalls.forEach((b) => {
        const r = b.result;
        if (["0", "1", "2", "3", "4", "6"].includes(r)) {
          const v = parseInt(r);
          runs += v;
          ballsFaced++;
          if (v === 4) fours++;
          if (v === 6) sixes++;
        } else if (r === "W") {
          ballsFaced++;
        } else if (r === "LB" || r === "B") {
          ballsFaced++;
        }
      });
      const strikeRate = ballsFaced > 0 ? parseFloat(((runs / ballsFaced) * 100).toFixed(1)) : 0;

      // --- bowling ---
      const bowlerBalls = validBalls.filter((b) => b.bowler === p.id);
      let wickets = 0;
      bowlerBalls.forEach((b) => {
        if (b.result === "W") wickets++;
      });

      // --- matches played (only valid matches) ---
      const matchesBatted = new Set(batterBalls.map((b) => b.matchId));
      const matchesBowled = new Set(bowlerBalls.map((b) => b.matchId));
      const playerMatchIds = new Set([...matchesBatted, ...matchesBowled]);
      matchPlayers
        .filter((mp) => mp.playerId === p.id && validMatchIds.has(mp.matchId))
        .forEach((mp) => playerMatchIds.add(mp.matchId));

      return {
        ...p,
        runs,
        wickets,
        matches: playerMatchIds.size,
        strikeRate,
      };
    });
  }, [players, localBalls, matchPlayers, matches, playersLoading, matchesLoading]);
}

function OverallPerformance({ players, matchCount }: { players: Player[]; matchCount: number }) {
  if (matchCount === 0) {
    return (
      <p className="text-muted-foreground text-center py-6">No match data available.</p>
    );
  }

  const hasData = players.some((p) => p.runs > 0 || p.wickets > 0);
  if (!hasData) return null;

  const maxRuns = Math.max(...players.map((p) => p.runs));
  const maxWickets = Math.max(...players.map((p) => p.wickets));
  const topScorers = maxRuns > 0 ? players.filter((p) => p.runs === maxRuns) : [];
  const topWicketTakers = maxWickets > 0 ? players.filter((p) => p.wickets === maxWickets) : [];

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      {topScorers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-5"
          style={{ background: "linear-gradient(135deg, hsl(30 90% 55% / 0.15), hsl(30 90% 55% / 0.05))", borderColor: "hsl(30 90% 55% / 0.3)" }}
        >
          <div className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: "hsl(30 90% 55%)" }}>
            <span className="text-lg">🏏</span> Overall Top Scorer
          </div>
          {topScorers.map((p) => (
            <p key={p.id} className="text-foreground font-bold text-lg">
              {p.name} <span className="font-normal text-muted-foreground">— {p.runs} runs</span>
            </p>
          ))}
        </motion.div>
      )}

      {topWicketTakers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-5"
          style={{ background: "linear-gradient(135deg, hsl(270 60% 55% / 0.15), hsl(270 60% 55% / 0.05))", borderColor: "hsl(270 60% 55% / 0.3)" }}
        >
          <div className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: "hsl(270 60% 55%)" }}>
            <span className="text-lg">🎯</span> Overall Top Wicket Taker
          </div>
          {topWicketTakers.map((p) => (
            <p key={p.id} className="text-foreground font-bold text-lg">
              {p.name} <span className="font-normal text-muted-foreground">— {p.wickets} wickets</span>
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function Players() {
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, error: matchErrorObj } = useMatches();
  const { data: players = [], isLoading: playersLoading, isError: playersError, error: playersErrorObj } = usePlayers();
  const computedPlayers = useComputedPlayers();

  const isLoading = playersLoading || matchesLoading;
  const isError = playersError || matchesError;
  const errorMsg = playersErrorObj?.message || matchErrorObj?.message || "Failed to load data";

  if (isLoading) {
    return <div className="container py-10">Loading players...</div>;
  }

  if (isError) {
    return <div className="container py-10">Error: {errorMsg}</div>;
  }

  return (
    <div className="container py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading text-4xl font-bold text-gradient-gold mb-8"
      >
        Squad
      </motion.h1>

      <OverallPerformance players={computedPlayers} matchCount={matches.length} />

      {computedPlayers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">No players added yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {computedPlayers.map((p, i) => (
            <PlayerCard key={p.id} player={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
