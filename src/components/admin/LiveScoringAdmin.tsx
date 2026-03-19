import { useState, useMemo, useCallback } from "react";
import { useData } from "@/context/DataContext";
import { Match } from "@/types/cricket";
import {
  calculateInningsScore,
  getNextBallInfo,
  isOverComplete,
  calculateBattingStats,
  calculateBowlingStats,
} from "@/lib/scoreCalculator";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Activity, Zap, RotateCcw, ChevronRight, Star, Shield, Coins } from "lucide-react";

const BALL_COLORS: Record<string, string> = {
  "0": "bg-muted text-muted-foreground",
  "1": "bg-secondary text-foreground",
  "2": "bg-secondary text-foreground",
  "3": "bg-secondary text-foreground",
  "4": "bg-primary/20 text-primary border border-primary/40",
  "6": "bg-accent/20 text-accent border border-accent/40",
  "W": "bg-destructive/20 text-destructive border border-destructive/40",
  "WD": "bg-muted text-muted-foreground border border-border",
  "NB": "bg-muted text-muted-foreground border border-border",
  "LB": "bg-muted text-muted-foreground border border-border",
  "B": "bg-muted text-muted-foreground border border-border",
};

const QUICK_BUTTONS = [
  { label: "0", value: "0", color: "bg-secondary hover:bg-secondary/80 text-foreground" },
  { label: "1", value: "1", color: "bg-secondary hover:bg-secondary/80 text-foreground" },
  { label: "2", value: "2", color: "bg-secondary hover:bg-secondary/80 text-foreground" },
  { label: "3", value: "3", color: "bg-secondary hover:bg-secondary/80 text-foreground" },
  { label: "4", value: "4", color: "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40" },
  { label: "6", value: "6", color: "bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40" },
  { label: "W", value: "W", color: "bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/40" },
  { label: "WD", value: "WD", color: "bg-muted hover:bg-muted/80 text-muted-foreground border border-border" },
  { label: "NB", value: "NB", color: "bg-muted hover:bg-muted/80 text-muted-foreground border border-border" },
];

type Phase = "select-match" | "select-openers" | "select-bowler" | "scoring" | "select-new-batsman" | "select-new-bowler";

export default function LiveScoringAdmin() {
  const { matches, balls, players, matchPlayers, updateMatch, addBall, deleteBall } = useData();
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [phase, setPhase] = useState<Phase>("select-match");
  const [pendingStriker, setPendingStriker] = useState("");
  const [pendingNonStriker, setPendingNonStriker] = useState("");
  const [pendingBowler, setPendingBowler] = useState("");

  const match = matches.find((m) => m.id === selectedMatchId);
  const matchBalls = useMemo(() => balls.filter((b) => b.matchId === selectedMatchId), [balls, selectedMatchId]);
  const currentInnings = match?.currentInnings || "A";

  // Get team players for current innings
  const assigned = useMemo(() => matchPlayers.filter((mp) => mp.matchId === selectedMatchId), [matchPlayers, selectedMatchId]);
  // Determine batting/bowling teams based on toss and current innings
  const tossWinner = match?.tossWinner; // "A" or "B"
  const tossDecision = match?.tossDecision; // "bat" or "bowl"
  
  // Which team letter bats first (in innings "A")
  const battingFirstTeam: "A" | "B" = tossWinner
    ? (tossDecision === "bat" ? tossWinner : (tossWinner === "A" ? "B" : "A"))
    : "A";
  const bowlingFirstTeam: "A" | "B" = battingFirstTeam === "A" ? "B" : "A";
  
  const battingTeam = currentInnings === "A" ? battingFirstTeam : bowlingFirstTeam;
  const bowlingTeam = currentInnings === "A" ? bowlingFirstTeam : battingFirstTeam;
  const battingSquad = assigned.filter((mp) => mp.team === battingTeam);
  const bowlingSquad = assigned.filter((mp) => mp.team === bowlingTeam);

  // Dynamic team names derived from toss (single source of truth)
  const inningsATeamName = match?.inningsATeam || match?.teamA || "";
  const inningsBTeamName = match?.inningsBTeam || match?.teamB || "";
  const currentBattingTeamName = currentInnings === "A" ? inningsATeamName : inningsBTeamName;
  const currentBowlingTeamName = currentInnings === "A" ? inningsBTeamName : inningsATeamName;

  const getPlayerName = useCallback((id: string) => players.find((p) => p.id === id)?.name || "Unknown", [players]);

  const outBatsmen = match?.outBatsmen || [];

  // Available batsmen (not out, not already batting)
  const availableBatsmen = battingSquad.filter(
    (mp) => !outBatsmen.includes(mp.playerId) &&
      mp.playerId !== match?.striker &&
      mp.playerId !== match?.nonStriker
  );

  // Bowlers - prevent consecutive overs by same bowler (applies after first over)
  const lastOverBowler = match?.lastBowler;
  const availableBowlers = bowlingSquad.filter((mp) => mp.playerId !== lastOverBowler);

  // Scores
  const scoreA = calculateInningsScore(matchBalls, "A");
  const scoreB = calculateInningsScore(matchBalls, "B");
  const currentScore = currentInnings === "A" ? scoreA : scoreB;

  // Chase calculations
  const totalOvers = match?.totalOvers || 20;
  const totalBallsInInnings = totalOvers * 6;
  const target = scoreA.totalRuns + 1;
  const inningsBBalls = matchBalls.filter((b) => b.innings === "B" && !["WD", "NB"].includes(b.result)).length;
  const ballsRemaining = totalBallsInInnings - inningsBBalls;
  const runsNeeded = target - scoreB.totalRuns;
  const teamBAllOut = (match?.outBatsmen || []).length >= (battingSquad.length - 1) && currentInnings === "B";

  // Auto-sync match scores
  if (match && match.status === "live") {
    const newScoreA = scoreA.score;
    const newScoreB = scoreB.score;
    if (match.scoreA !== newScoreA || match.scoreB !== newScoreB || match.oversA !== scoreA.overs || match.oversB !== scoreB.overs) {
      setTimeout(() => {
        updateMatch({ ...match, scoreA: newScoreA, scoreB: newScoreB, oversA: scoreA.overs, oversB: scoreB.overs });
      }, 0);
    }
  }

  // Ball-by-ball current innings
  const currentBalls = useMemo(() =>
    matchBalls.filter((b) => b.innings === currentInnings).sort((a, b) => a.over - b.over || a.ball - b.ball),
    [matchBalls, currentInnings]
  );

  const overs: Record<number, typeof currentBalls> = {};
  currentBalls.forEach((b) => {
    if (!overs[b.over]) overs[b.over] = [];
    overs[b.over].push(b);
  });

  // Batting / bowling live stats
  const livebatting = calculateBattingStats(matchBalls, currentInnings);
  const livebowling = calculateBowlingStats(matchBalls, currentInnings);

  // -- ACTIONS --
  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(id);
    const m = matches.find((x) => x.id === id);
    if (!m) { setPhase("select-match"); return; }
    if (m.status === "live" && m.striker && m.nonStriker && m.currentBowler) {
      setPhase("scoring");
    } else if (m.status === "live" && m.striker && m.nonStriker) {
      setPhase("select-bowler");
    } else if (m.status === "live") {
      setPhase("select-openers");
    } else {
      setPhase("select-match");
    }
  };

  const saveToss = (winner: "A" | "B", decision: "bat" | "bowl") => {
    if (!match || match.tossCompleted) return;
    const battingFirst = decision === "bat" ? winner : (winner === "A" ? "B" : "A");
    const iaTeam = battingFirst === "A" ? match.teamA : match.teamB;
    const ibTeam = battingFirst === "A" ? match.teamB : match.teamA;
    updateMatch({ ...match, tossWinner: winner, tossDecision: decision, tossCompleted: true, inningsATeam: iaTeam, inningsBTeam: ibTeam });
  };

  const startMatch = () => {
    if (!match || !match.tossCompleted) return;
    // Determine first batting team based on toss
    // If toss winner chose bat, they bat first (innings A = toss winner's team)
    // We keep teamA/teamB as-is but set currentInnings accordingly
    // Innings "A" always means team batting first, "B" means team batting second
    // The batting/bowling team assignments already use currentInnings
    updateMatch({ ...match, status: "live", liveScoring: true, currentInnings: "A", outBatsmen: [] });
    setPhase("select-openers");
  };

  const confirmOpeners = () => {
    if (!match || !pendingStriker || !pendingNonStriker) return;
    updateMatch({ ...match, striker: pendingStriker, nonStriker: pendingNonStriker });
    setPendingStriker("");
    setPendingNonStriker("");
    setPhase("select-bowler");
  };

  const confirmBowler = () => {
    if (!match || !pendingBowler) return;
    // Validate: cannot bowl consecutive overs
    if (match.lastBowler && pendingBowler === match.lastBowler) {
      alert("Bowler cannot bowl consecutive overs.");
      return;
    }
    updateMatch({ ...match, currentBowler: pendingBowler });
    setPendingBowler("");
    setPhase("scoring");
  };

  // Check if innings overs are exhausted
  const inningsALegal = matchBalls.filter((b) => b.innings === "A" && !["WD", "NB"].includes(b.result)).length;
  const inningsBLegal = matchBalls.filter((b) => b.innings === "B" && !["WD", "NB"].includes(b.result)).length;
  const inningsAComplete = inningsALegal >= totalBallsInInnings;
  const inningsBComplete = inningsBLegal >= totalBallsInInnings;
  const currentInningsComplete = currentInnings === "A" ? inningsAComplete : inningsBComplete;

  const addQuickBall = (result: string) => {
    if (!match || !match.currentInnings || !match.striker || !match.currentBowler) return;
    // Block if overs exhausted
    if (currentInningsComplete) return;
    const next = getNextBallInfo(matchBalls, match.currentInnings);
    
    addBall({
      matchId: match.id,
      innings: match.currentInnings,
      over: next.over,
      ball: next.ball,
      result,
      batter: match.striker,
      bowler: match.currentBowler,
    });

    // Post-ball logic (deferred to allow state to update)
    setTimeout(() => handlePostBall(result, next.over, next.ball), 50);
  };

  // Auto-end match checks (called after state settles)
  const checkAutoResult = useCallback(() => {
    if (!match || match.status !== "live") return;
    const latestBalls = balls.filter((b) => b.matchId === match.id);
    const latestScoreA = calculateInningsScore(latestBalls, "A");
    const latestScoreB = calculateInningsScore(latestBalls, "B");

    // Auto-switch innings A → B when overs exhausted
    if (currentInnings === "A") {
      const legalA = latestBalls.filter((b) => b.innings === "A" && !["WD", "NB"].includes(b.result)).length;
      if (legalA >= totalBallsInInnings) {
        switchInnings();
      }
      return;
    }

    // Innings B checks
    const tgt = latestScoreA.totalRuns + 1;
    const legalB = latestBalls.filter((b) => b.innings === "B" && !["WD", "NB"].includes(b.result)).length;
    const bRem = totalBallsInInnings - legalB;
    const rNeeded = tgt - latestScoreB.totalRuns;
    const outs = (match.outBatsmen || []).length;
    const battingTeamSquadSize = assigned.filter((mp) => mp.team === bowlingFirstTeam).length;

    // Chasing team reached/exceeded target
    if (rNeeded <= 0) {
      const wicketsLost = latestScoreB.wickets;
      endMatch(`${inningsBTeamName} won by ${battingTeamSquadSize - 1 - wicketsLost} wickets`);
      return;
    }
    // All out
    if (outs >= battingTeamSquadSize - 1) {
      const diff = latestScoreA.totalRuns - latestScoreB.totalRuns;
      if (diff === 0) {
        endMatch("Match Tied");
      } else {
        endMatch(`${inningsATeamName} won by ${diff} runs`);
      }
      return;
    }
    // Overs exhausted
    if (bRem <= 0) {
      const diff = latestScoreA.totalRuns - latestScoreB.totalRuns;
      if (diff === 0) {
        endMatch("Match Tied");
      } else if (latestScoreB.totalRuns >= tgt) {
        endMatch(`${inningsBTeamName} won by ${battingTeamSquadSize - 1 - latestScoreB.wickets} wickets`);
      } else {
        endMatch(`${inningsATeamName} won by ${diff} runs`);
      }
    }
  }, [match, balls, currentInnings, totalBallsInInnings, assigned]);

  const handlePostBall = (result: string, overNum: number, ballNum: number) => {
    if (!match) return;
    const isLegal = !["WD", "NB"].includes(result);
    const isWicket = result === "W";
    const runsScored = ["1", "2", "3", "4", "5", "6"].includes(result) ? parseInt(result) : 0;
    const isOddRuns = runsScored % 2 === 1;
    const isEndOfOver = isLegal && ballNum >= 6;

    if (isWicket) {
      const newOut = [...(match.outBatsmen || []), match.striker!];
      if (isEndOfOver) {
        // Wicket on last ball of over: need new batsman AND new bowler
        // Swap strike at end of over (non-striker faces next over)
        updateMatch({
          ...match,
          outBatsmen: newOut,
          striker: undefined,
          nonStriker: match.nonStriker,
          lastBowler: match.currentBowler,
          currentBowler: undefined,
        });
      } else {
        updateMatch({ ...match, outBatsmen: newOut, striker: undefined });
      }
      // Check all-out or auto result after wicket
      setTimeout(() => checkAutoResult(), 100);
      setPhase("select-new-batsman");
      return;
    }

    // Check auto-result after every ball
    setTimeout(() => checkAutoResult(), 100);

    let newStriker = match.striker;
    let newNonStriker = match.nonStriker;

    // Swap on odd runs
    if (isOddRuns) {
      newStriker = match.nonStriker;
      newNonStriker = match.striker;
    }

    if (isEndOfOver) {
      // Swap again at end of over (net effect: if odd runs + end of over, they cancel)
      const temp = newStriker;
      newStriker = newNonStriker;
      newNonStriker = temp;
      // Need new bowler
      updateMatch({
        ...match,
        striker: newStriker,
        nonStriker: newNonStriker,
        lastBowler: match.currentBowler,
        currentBowler: undefined,
      });
      setPhase("select-new-bowler");
      setTimeout(() => checkAutoResult(), 100);
      return;
    }

    if (newStriker !== match.striker || newNonStriker !== match.nonStriker) {
      updateMatch({ ...match, striker: newStriker, nonStriker: newNonStriker });
    }
  };

  const confirmNewBatsman = () => {
    if (!match || !pendingStriker) return;
    updateMatch({ ...match, striker: pendingStriker });
    setPendingStriker("");
    // If bowler was cleared (wicket on last ball of over), need new bowler too
    if (!match.currentBowler) {
      setPhase("select-new-bowler");
    } else {
      setPhase("scoring");
    }
  };

  const confirmNewBowler = () => {
    if (!match || !pendingBowler) return;
    if (match.lastBowler && pendingBowler === match.lastBowler) {
      alert("Bowler cannot bowl consecutive overs.");
      return;
    }
    updateMatch({ ...match, currentBowler: pendingBowler });
    setPendingBowler("");
    setPhase("scoring");
  };

  const switchInnings = () => {
    if (!match) return;
    const newInnings = currentInnings === "A" ? "B" : "A";
    updateMatch({
      ...match,
      currentInnings: newInnings as "A" | "B",
      striker: undefined,
      nonStriker: undefined,
      currentBowler: undefined,
      lastBowler: undefined,
      outBatsmen: [],
    });
    setPhase("select-openers");
  };

  const toggleLiveScoring = () => {
    if (!match) return;
    updateMatch({ ...match, liveScoring: !match.liveScoring });
  };

  const endMatch = (result: string) => {
    if (!match) return;
    updateMatch({
      ...match,
      status: "completed",
      liveScoring: false,
      scoreA: scoreA.score,
      scoreB: scoreB.score,
      oversA: scoreA.overs,
      oversB: scoreB.overs,
      result,
      striker: undefined,
      nonStriker: undefined,
      currentBowler: undefined,
    });
    setPhase("select-match");
  };

  const undoLastBall = () => {
    if (!match?.currentInnings) return;
    const inningsBalls = matchBalls
      .filter((b) => b.innings === match.currentInnings)
      .sort((a, b) => a.over - b.over || a.ball - b.ball);
    if (inningsBalls.length > 0) {
      const lastBall = inningsBalls[inningsBalls.length - 1];
      // If last ball was a wicket, restore the batter
      if (lastBall.result === "W" && lastBall.batter) {
        const newOut = (match.outBatsmen || []).filter((id) => id !== lastBall.batter);
        updateMatch({ ...match, striker: lastBall.batter, outBatsmen: newOut });
        setPhase("scoring");
      }
      deleteBall(lastBall.id);
    }
  };

  // No squad assigned warning
  const noSquad = battingSquad.length === 0 || bowlingSquad.length === 0;

  return (
    <div>
      {/* Match Selector */}
      <div className="mb-6">
        <label className="text-xs text-muted-foreground mb-1 block">Select Match</label>
        <select
          value={selectedMatchId}
          onChange={(e) => handleSelectMatch(e.target.value)}
          className="w-full max-w-md bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">-- Select a match --</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.teamA} vs {m.teamB} ({m.date}) — {m.status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {!selectedMatchId && (
        <p className="text-muted-foreground text-sm">Select a match to start live scoring.</p>
      )}

      {match && (
        <div className="space-y-4">
          {/* Match Controls */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {match.teamA} vs {match.teamB}
              </h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                match.status === "live" ? "bg-destructive text-destructive-foreground animate-pulse" :
                match.status === "completed" ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {match.status.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {match.status === "upcoming" && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Overs:</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={match.totalOvers || 20}
                      onChange={(e) => updateMatch({ ...match, totalOvers: parseInt(e.target.value) || 20 })}
                      className="w-16 bg-secondary text-foreground border border-border rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button onClick={startMatch} disabled={noSquad || !match.tossCompleted}
                    className="flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Play className="w-4 h-4" /> Start Match
                  </button>
                </>
              )}
              {noSquad && match.status === "upcoming" && (
                <p className="text-xs text-destructive">⚠ Assign players to both teams first (Team Admin tab)</p>
              )}
              {!match.tossCompleted && match.status === "upcoming" && !noSquad && (
                <p className="text-xs text-destructive">⚠ Complete the toss before starting the match</p>
              )}

              {match.status === "live" && (
                <>
                  <button onClick={toggleLiveScoring}
                    className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-md transition-opacity ${
                      match.liveScoring ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}>
                    <Zap className="w-4 h-4" /> Live {match.liveScoring ? "ON" : "OFF"}
                  </button>

                  <button onClick={switchInnings}
                    className="flex items-center gap-2 bg-primary/20 text-primary font-semibold px-4 py-2 rounded-md hover:bg-primary/30 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Switch Innings ({currentInnings === "A" ? "→ B" : "→ A"})
                  </button>

                  <button
                    onClick={() => {
                      const result = prompt("Enter match result (e.g., 'Team A won by 15 runs'):");
                      if (result) endMatch(result);
                    }}
                    className="flex items-center gap-2 bg-destructive/20 text-destructive font-semibold px-4 py-2 rounded-md hover:bg-destructive/30 transition-colors">
                    <Square className="w-4 h-4" /> End Match
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Toss Panel */}
          {match.status === "upcoming" && !noSquad && !match.tossCompleted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" /> Toss
              </h3>
              <TossPanel teamA={match.teamA} teamB={match.teamB} onSave={saveToss} />
            </motion.div>
          )}

          {/* Toss Result Display */}
          {match.tossCompleted && match.tossWinner && match.tossDecision && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-accent">
                {match.tossWinner === "A" ? match.teamA : match.teamB} won the toss and chose to {match.tossDecision}
              </p>
            </motion.div>
          )}

          {/* Live Score Board */}
          {match.status !== "upcoming" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-navy rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-lg ${currentInnings === "A" ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{inningsATeamName} {currentInnings === "A" ? "⬅ Batting" : ""}</p>
                  <p className="font-heading text-3xl font-bold text-primary">{scoreA.score}</p>
                  <p className="text-xs text-muted-foreground">({scoreA.overs} ov)</p>
                </div>
                <div className={`p-4 rounded-lg ${currentInnings === "B" ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{inningsBTeamName} {currentInnings === "B" ? "⬅ Batting" : ""}</p>
                  <p className="font-heading text-3xl font-bold text-primary">{scoreB.score}</p>
                  <p className="text-xs text-muted-foreground">({scoreB.overs} ov)</p>
                </div>
              </div>

              {/* Current Batsmen & Bowler Display */}
              {match.status === "live" && match.striker && (
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-card/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Striker</p>
                    <p className="font-bold text-foreground">{getPlayerName(match.striker)} *</p>
                    {livebatting.find((b) => b.playerId === match.striker) && (
                      <p className="text-primary font-bold">
                        {livebatting.find((b) => b.playerId === match.striker)!.runs}({livebatting.find((b) => b.playerId === match.striker)!.balls})
                      </p>
                    )}
                  </div>
                  {match.nonStriker && (
                    <div className="bg-card/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Non-Striker</p>
                      <p className="font-bold text-foreground">{getPlayerName(match.nonStriker)}</p>
                      {livebatting.find((b) => b.playerId === match.nonStriker) && (
                        <p className="text-primary font-bold">
                          {livebatting.find((b) => b.playerId === match.nonStriker)!.runs}({livebatting.find((b) => b.playerId === match.nonStriker)!.balls})
                        </p>
                      )}
                    </div>
                  )}
                  {match.currentBowler && (
                    <div className="bg-card/50 rounded-lg p-2">
                      <p className="text-muted-foreground">Bowler</p>
                      <p className="font-bold text-foreground">{getPlayerName(match.currentBowler)}</p>
                      {livebowling.find((b) => b.playerId === match.currentBowler) && (
                        <p className="text-primary font-bold">
                          {livebowling.find((b) => b.playerId === match.currentBowler)!.wickets}-{livebowling.find((b) => b.playerId === match.currentBowler)!.runs} ({livebowling.find((b) => b.playerId === match.currentBowler)!.overs})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Chase Banner */}
              {match.status === "live" && currentInnings === "B" && scoreA.totalRuns > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-accent/10 border border-accent/30 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">Target: {target}</p>
                  <p className="font-heading text-sm font-bold text-accent">
                    {runsNeeded > 0
                      ? `${inningsBTeamName} needs ${runsNeeded} run${runsNeeded !== 1 ? "s" : ""} in ${ballsRemaining} ball${ballsRemaining !== 1 ? "s" : ""}`
                      : `${inningsBTeamName} have reached the target!`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    RRR: {ballsRemaining > 0 && runsNeeded > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : "—"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase: Select Opening Batsmen */}
          {match.status === "live" && phase === "select-openers" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Select Opening Batsmen
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Striker</label>
                  <select value={pendingStriker} onChange={(e) => setPendingStriker(e.target.value)}
                    className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                    <option value="">-- Select --</option>
                    {battingSquad.filter((mp) => mp.playerId !== pendingNonStriker).map((mp) => (
                      <option key={mp.playerId} value={mp.playerId}>{getPlayerName(mp.playerId)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Non-Striker</label>
                  <select value={pendingNonStriker} onChange={(e) => setPendingNonStriker(e.target.value)}
                    className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                    <option value="">-- Select --</option>
                    {battingSquad.filter((mp) => mp.playerId !== pendingStriker).map((mp) => (
                      <option key={mp.playerId} value={mp.playerId}>{getPlayerName(mp.playerId)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={confirmOpeners} disabled={!pendingStriker || !pendingNonStriker}
                className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                Confirm <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase: Select Bowler */}
          {match.status === "live" && (phase === "select-bowler" || phase === "select-new-bowler") && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                {phase === "select-bowler" ? "Select Opening Bowler" : "Select Bowler for Next Over"}
              </h3>
              {match.lastBowler && (
                <p className="text-xs text-muted-foreground mb-2">
                  Last over bowled by: <span className="font-semibold text-foreground">{getPlayerName(match.lastBowler)}</span> (cannot bowl consecutive)
                </p>
              )}
              <select value={pendingBowler} onChange={(e) => setPendingBowler(e.target.value)}
                className="w-full max-w-sm bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option value="">-- Select bowler --</option>
                {(lastOverBowler ? availableBowlers : bowlingSquad).map((mp) => (
                  <option key={mp.playerId} value={mp.playerId}>{getPlayerName(mp.playerId)}</option>
                ))}
              </select>
              <button onClick={phase === "select-bowler" ? confirmBowler : confirmNewBowler}
                disabled={!pendingBowler}
                className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                Confirm <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase: Select New Batsman (after wicket) */}
          {match.status === "live" && phase === "select-new-batsman" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-destructive/30 rounded-xl p-5">
              <h3 className="font-heading text-sm font-bold text-destructive mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> WICKET! Select Next Batsman
              </h3>
              {availableBatsmen.length === 0 ? (
                <p className="text-xs text-muted-foreground">All out! No more batsmen available.</p>
              ) : (
                <>
                  <select value={pendingStriker} onChange={(e) => setPendingStriker(e.target.value)}
                    className="w-full max-w-sm bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                    <option value="">-- Select batsman --</option>
                    {availableBatsmen.map((mp) => (
                      <option key={mp.playerId} value={mp.playerId}>{getPlayerName(mp.playerId)}</option>
                    ))}
                  </select>
                  <button onClick={confirmNewBatsman} disabled={!pendingStriker}
                    className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                    Confirm <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Quick Ball Entry */}
          {match.status === "live" && match.liveScoring && phase === "scoring" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Ball Entry — {currentBattingTeamName} Batting
                </h3>
                <button onClick={undoLastBall} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <RotateCcw className="w-3 h-3" /> Undo
                </button>
              </div>

              {currentInningsComplete && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-destructive">⛔ Overs completed — no more balls allowed</p>
                </div>
              )}

              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {QUICK_BUTTONS.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => addQuickBall(btn.value)}
                    disabled={currentInningsComplete}
                    className={`h-12 rounded-lg font-bold text-sm transition-all active:scale-95 ${btn.color} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Over-by-Over Display */}
          {Object.keys(overs).length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {currentBattingTeamName} — Over-by-Over
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {Object.entries(overs).map(([overNum, overBalls]) => {
                    const bowlerId = overBalls.find((b) => b.bowler)?.bowler;
                    const bowlerName = bowlerId ? getPlayerName(bowlerId) : null;
                    const overRuns = overBalls.reduce((s, b) => {
                      const r = b.result;
                      if (["1","2","3","4","5","6"].includes(r)) return s + parseInt(r);
                      if (["WD","NB","LB","B"].includes(r)) return s + 1;
                      return s;
                    }, 0);
                    const overWickets = overBalls.filter((b) => b.result === "W").length;
                    const isLegalComplete = overBalls.filter((b) => !["WD","NB"].includes(b.result)).length >= 6;
                    const isCurrentOver = !isLegalComplete && Object.keys(overs).indexOf(overNum) === Object.keys(overs).length - 1;

                    return (
                      <motion.div
                        key={overNum}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                          isCurrentOver ? "bg-primary/5 border border-primary/20" : "hover:bg-secondary/30"
                        }`}
                      >
                        <div className="shrink-0 w-28">
                          <span className="text-xs font-bold text-foreground">OV {overNum}</span>
                          {bowlerName && (
                            <p className="text-[10px] text-primary truncate">{bowlerName}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <AnimatePresence>
                            {overBalls.map((b, i) => (
                              <motion.div
                                key={b.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                  BALL_COLORS[b.result] || "bg-muted text-muted-foreground"
                                } ${isCurrentOver && i === overBalls.length - 1 ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                              >
                                {b.result === "0" ? "•" : b.result}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        <div className="ml-auto text-right shrink-0">
                          <span className="text-xs font-bold text-foreground">{overRuns} runs</span>
                          {overWickets > 0 && (
                            <p className="text-[10px] text-destructive font-semibold">{overWickets}W</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Live Batting Stats */}
          {livebatting.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/50">
                <h3 className="font-heading text-sm font-bold text-foreground">
                  {currentBattingTeamName} — Live Batting
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="text-left px-4 py-2 font-medium">Batter</th>
                      <th className="text-center px-2 py-2 font-medium">R</th>
                      <th className="text-center px-2 py-2 font-medium">B</th>
                      <th className="text-center px-2 py-2 font-medium">4s</th>
                      <th className="text-center px-2 py-2 font-medium">6s</th>
                      <th className="text-center px-2 py-2 font-medium">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livebatting.map((b) => (
                      <tr key={b.playerId} className={`border-b border-border/50 transition-colors ${
                        b.playerId === match.striker ? "bg-primary/5" : b.isOut ? "opacity-60" : ""
                      }`}>
                        <td className="px-4 py-2.5 font-semibold text-foreground">
                          {getPlayerName(b.playerId)}
                          {b.playerId === match.striker && <span className="text-primary ml-1">*</span>}
                          {b.isOut && <span className="text-destructive ml-1 text-xs">(out)</span>}
                        </td>
                        <td className="text-center px-2 py-2.5 font-bold text-foreground">{b.runs}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.balls}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.fours}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.sixes}</td>
                        <td className="text-center px-2 py-2.5 text-primary font-medium">{b.strikeRate.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Live Bowling Stats */}
          {livebowling.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/50">
                <h3 className="font-heading text-sm font-bold text-foreground">
                  {currentBowlingTeamName} — Live Bowling
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="text-left px-4 py-2 font-medium">Bowler</th>
                      <th className="text-center px-2 py-2 font-medium">O</th>
                      <th className="text-center px-2 py-2 font-medium">R</th>
                      <th className="text-center px-2 py-2 font-medium">W</th>
                      <th className="text-center px-2 py-2 font-medium">Econ</th>
                      <th className="text-center px-2 py-2 font-medium">Dots</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livebowling.map((b) => (
                      <tr key={b.playerId} className={`border-b border-border/50 transition-colors ${
                        b.playerId === match.currentBowler ? "bg-primary/5" : ""
                      }`}>
                        <td className="px-4 py-2.5 font-semibold text-foreground">
                          {getPlayerName(b.playerId)}
                          {b.playerId === match.currentBowler && <span className="text-primary ml-1">*</span>}
                        </td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.overs}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.runs}</td>
                        <td className="text-center px-2 py-2.5 font-bold text-foreground">{b.wickets}</td>
                        <td className="text-center px-2 py-2.5 text-primary font-medium">{b.economy.toFixed(1)}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground">{b.dots}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Both Innings Summary */}
          {match.status !== "upcoming" && (
            <div className="grid md:grid-cols-2 gap-4">
              <InningsSummary label={`${inningsATeamName} (1st Innings)`} balls={matchBalls.filter((b) => b.innings === "A")} score={scoreA} />
              <InningsSummary label={`${inningsBTeamName} (2nd Innings)`} balls={matchBalls.filter((b) => b.innings === "B")} score={scoreB} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InningsSummary({ label, balls: inningBalls, score }: {
  label: string;
  balls: any[];
  score: { score: string; overs: string; totalRuns: number; wickets: number };
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
        <h4 className="font-heading text-sm font-bold text-foreground">{label}</h4>
        <span className="font-heading text-sm font-bold text-primary">{score.score} ({score.overs} ov)</span>
      </div>
      <div className="p-4">
        {inningBalls.length === 0 ? (
          <p className="text-xs text-muted-foreground">No balls bowled yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {inningBalls.sort((a: any, b: any) => a.over - b.over || a.ball - b.ball).map((b: any) => (
              <div key={b.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${BALL_COLORS[b.result] || "bg-muted text-muted-foreground"}`}>
                {b.result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TossPanel({ teamA, teamB, onSave }: { teamA: string; teamB: string; onSave: (winner: "A" | "B", decision: "bat" | "bowl") => void }) {
  const [winner, setWinner] = useState<"A" | "B" | "">("");
  const [decision, setDecision] = useState<"bat" | "bowl" | "">("");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Who won the toss?</label>
        <div className="flex gap-2">
          <button
            onClick={() => setWinner("A")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              winner === "A" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {teamA}
          </button>
          <button
            onClick={() => setWinner("B")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              winner === "B" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {teamB}
          </button>
        </div>
      </div>

      {winner && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <label className="text-xs text-muted-foreground mb-2 block">
            {winner === "A" ? teamA : teamB} chose to…
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDecision("bat")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                decision === "bat" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              🏏 Bat
            </button>
            <button
              onClick={() => setDecision("bowl")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                decision === "bowl" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              🎯 Bowl
            </button>
          </div>
        </motion.div>
      )}

      {winner && decision && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center mb-3">
            <p className="text-sm font-semibold text-accent">
              {winner === "A" ? teamA : teamB} won the toss and chose to {decision}
            </p>
          </div>
          <button
            onClick={() => onSave(winner, decision)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
          >
            Confirm Toss <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
