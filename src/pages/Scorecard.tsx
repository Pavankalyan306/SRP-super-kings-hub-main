import { useParams, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { calculateInningsScore, calculateBattingStats, calculateBowlingStats } from "@/lib/scoreCalculator";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Activity, User, Star, Shield, Coins } from "lucide-react";

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
};

export default function Scorecard() {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, batting, bowling, balls, matchPlayers, players } = useData();

  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Match not found.</p>
        <Link to="/matches" className="text-primary underline mt-4 inline-block">← Back to Matches</Link>
      </div>
    );
  }

  const matchBatting = batting.filter((b) => b.matchId === matchId);
  const matchBowling = bowling.filter((b) => b.matchId === matchId);
  const matchBalls = balls.filter((b) => b.matchId === matchId).sort((a, b) => a.over - b.over || a.ball - b.ball);

  const assigned = matchPlayers.filter((mp) => mp.matchId === matchId);
  const squadA = assigned.filter((mp) => mp.team === "A");
  const squadB = assigned.filter((mp) => mp.team === "B");
  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name || "Unknown";
  const getPlayerRole = (id: string) => players.find((p) => p.id === id)?.role || "";

  // Dynamic team names from toss (single source of truth)
  const inningsATeamName = match.inningsATeam || match.teamA;
  const inningsBTeamName = match.inningsBTeam || match.teamB;

  // Auto-calculated scores from balls
  const autoScoreA = calculateInningsScore(matchBalls, "A");
  const autoScoreB = calculateInningsScore(matchBalls, "B");
  const displayScoreA = matchBalls.some((b) => b.innings === "A") ? autoScoreA.score : match.scoreA;
  const displayScoreB = matchBalls.some((b) => b.innings === "B") ? autoScoreB.score : match.scoreB;
  const displayOversA = matchBalls.some((b) => b.innings === "A") ? autoScoreA.overs : match.oversA;
  const displayOversB = matchBalls.some((b) => b.innings === "B") ? autoScoreB.overs : match.oversB;

  // Auto-calculated batting/bowling from ball data
  const autoBattingA = calculateBattingStats(matchBalls, "A");
  const autoBattingB = calculateBattingStats(matchBalls, "B");
  const autoBowlingA = calculateBowlingStats(matchBalls, "A");
  const autoBowlingB = calculateBowlingStats(matchBalls, "B");

  // Use auto stats if available, else fall back to manual entries
  const hasBallDataA = matchBalls.some((b) => b.innings === "A" && b.batter);
  const hasBallDataB = matchBalls.some((b) => b.innings === "B" && b.batter);

  const battingA = hasBallDataA ? [] : matchBatting.filter((b) => b.team === "A");
  const battingB = hasBallDataB ? [] : matchBatting.filter((b) => b.team === "B");
  const bowlingA = hasBallDataA ? [] : matchBowling.filter((b) => b.team === "A");
  const bowlingB = hasBallDataB ? [] : matchBowling.filter((b) => b.team === "B");

  // Group balls by innings then by over
  const ballsA = matchBalls.filter((b) => b.innings === "A");
  const ballsB = matchBalls.filter((b) => b.innings === "B");

  const groupByOver = (ballList: typeof matchBalls) => {
    const overs: Record<number, typeof matchBalls> = {};
    ballList.forEach((b) => {
      if (!overs[b.over]) overs[b.over] = [];
      overs[b.over].push(b);
    });
    return overs;
  };

  const oversA = groupByOver(ballsA);
  const oversB = groupByOver(ballsB);
  const hasOvers = Object.keys(oversA).length > 0 || Object.keys(oversB).length > 0;

  const statusLabel = match.status === "completed" ? "FINAL" : match.status === "live" ? "LIVE" : "UPCOMING";
  const statusColor = match.status === "live" ? "bg-destructive text-destructive-foreground" : match.status === "completed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground";

  return (
    <div className="container py-8 max-w-4xl">
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Matches
      </Link>

      {/* Top Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-navy rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            <p className="font-heading text-lg font-bold text-foreground">{inningsATeamName}</p>
            <p className="font-heading text-2xl font-bold text-primary mt-1">{displayScoreA || "—"}</p>
            {displayOversA && <p className="text-xs text-muted-foreground">({displayOversA} ov)</p>}
          </div>
          <div className="text-center">
            <span className="text-muted-foreground font-heading text-sm">VS</span>
          </div>
          <div className="text-center">
            <p className="font-heading text-lg font-bold text-foreground">{inningsBTeamName}</p>
            <p className="font-heading text-2xl font-bold text-primary mt-1">{displayScoreB || "—"}</p>
            {displayOversB && <p className="text-xs text-muted-foreground">({displayOversB} ov)</p>}
          </div>
        </div>

        {match.result && (
          <p className="text-center text-sm font-semibold text-primary mt-4">{match.result}</p>
        )}

        {/* Toss Result */}
        {match.tossCompleted && match.tossWinner && match.tossDecision && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Coins className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs font-medium text-accent">
              {match.tossWinner === "A" ? match.teamA : match.teamB} won the toss and chose to {match.tossDecision}
            </p>
          </div>
        )}

        {/* Chase Banner */}
        {match.status === "live" && match.currentInnings === "B" && autoScoreA.totalRuns > 0 && (() => {
          const totalOvers = match.totalOvers || 20;
          const target = autoScoreA.totalRuns + 1;
          const legalBallsB = matchBalls.filter((b) => b.innings === "B" && !["WD", "NB"].includes(b.result)).length;
          const ballsRem = totalOvers * 6 - legalBallsB;
          const runsNeeded = target - autoScoreB.totalRuns;
          const rrr = ballsRem > 0 && runsNeeded > 0 ? ((runsNeeded / ballsRem) * 6).toFixed(2) : "—";
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Target: {target}</p>
              <p className="font-heading text-sm font-bold text-accent">
                {runsNeeded > 0
                  ? `${inningsBTeamName} needs ${runsNeeded} run${runsNeeded !== 1 ? "s" : ""} in ${ballsRem} ball${ballsRem !== 1 ? "s" : ""}`
                  : `${inningsBTeamName} have reached the target!`}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">RRR: {rrr}</p>
            </motion.div>
          );
        })()}
      </motion.div>

      {/* Ball-by-ball */}
      {hasOvers && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 mb-6">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Over-by-Over
          </h3>

          {Object.keys(oversA).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">{inningsATeamName} — 1st Innings</p>
              <OversList overs={oversA} getPlayerName={getPlayerName} isLive={match.status === "live" && match.currentInnings === "A"} />
            </div>
          )}

          {Object.keys(oversB).length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">{inningsBTeamName} — 2nd Innings</p>
              <OversList overs={oversB} getPlayerName={getPlayerName} isLive={match.status === "live" && match.currentInnings === "B"} />
            </div>
          )}
        </motion.div>
      )}

      {/* Auto Batting Stats from ball data */}
      {hasBallDataA && autoBattingA.length > 0 && (
        <AutoBattingTable title={`${inningsATeamName} — Batting`} entries={autoBattingA} getPlayerName={getPlayerName} striker={match.striker} delay={0.15} />
      )}
      {hasBallDataB && autoBattingB.length > 0 && (
        <AutoBattingTable title={`${inningsBTeamName} — Batting`} entries={autoBattingB} getPlayerName={getPlayerName} striker={match.striker} delay={0.2} />
      )}

      {/* Auto Bowling Stats from ball data */}
      {hasBallDataA && autoBowlingA.length > 0 && (
        <AutoBowlingTable title={`${inningsBTeamName} — Bowling`} entries={autoBowlingA} getPlayerName={getPlayerName} currentBowler={match.currentBowler} delay={0.25} />
      )}
      {hasBallDataB && autoBowlingB.length > 0 && (
        <AutoBowlingTable title={`${inningsATeamName} — Bowling`} entries={autoBowlingB} getPlayerName={getPlayerName} currentBowler={match.currentBowler} delay={0.3} />
      )}

      {/* Fallback manual Batting Scorecards */}
      {battingA.length > 0 && <BattingTable title={`${match.teamA} — Batting`} entries={battingA} delay={0.15} />}
      {battingB.length > 0 && <BattingTable title={`${match.teamB} — Batting`} entries={battingB} delay={0.2} />}

      {/* Fallback manual Bowling Scorecards */}
      {bowlingA.length > 0 && <BowlingTable title={`${match.teamA} — Bowling`} entries={bowlingA} delay={0.25} />}
      {bowlingB.length > 0 && <BowlingTable title={`${match.teamB} — Bowling`} entries={bowlingB} delay={0.3} />}

      {/* Squad Display */}
      {(squadA.length > 0 || squadB.length > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-6">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Playing XI
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {squadA.length > 0 && (
              <SquadPanel label={match.teamA} members={squadA} getPlayerName={getPlayerName} getPlayerRole={getPlayerRole} />
            )}
            {squadB.length > 0 && (
              <SquadPanel label={match.teamB} members={squadB} getPlayerName={getPlayerName} getPlayerRole={getPlayerRole} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function OversList({ overs, getPlayerName, isLive }: { overs: Record<number, any[]>; getPlayerName?: (id: string) => string; isLive?: boolean }) {
  const overKeys = Object.keys(overs);
  return (
    <div className="space-y-2">
      {Object.entries(overs).map(([overNum, overBalls]) => {
        const bowlerId = overBalls.find((b: any) => b.bowler)?.bowler;
        const bowlerName = bowlerId && getPlayerName ? getPlayerName(bowlerId) : null;
        const overRuns = overBalls.reduce((s: number, b: any) => {
          const r = b.result;
          if (["1","2","3","4","5","6"].includes(r)) return s + parseInt(r);
          if (["WD","NB","LB","B"].includes(r)) return s + 1;
          return s;
        }, 0);
        const overWickets = overBalls.filter((b: any) => b.result === "W").length;
        const isLegalComplete = overBalls.filter((b: any) => !["WD","NB"].includes(b.result)).length >= 6;
        const isCurrentOver = isLive && !isLegalComplete && overKeys.indexOf(overNum) === overKeys.length - 1;

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
              {overBalls.map((b: any, i: number) => (
                <div
                  key={b.id}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    BALL_COLORS[b.result] || "bg-muted text-muted-foreground"
                  } ${isCurrentOver && i === overBalls.length - 1 ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                >
                  {b.result === "0" ? "•" : b.result}
                </div>
              ))}
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
    </div>
  );
}

function BattingTable({ title, entries, delay }: { title: string; entries: any[]; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left px-4 py-2 font-medium">Batter</th>
              <th className="text-left px-4 py-2 font-medium">Dismissal</th>
              <th className="text-center px-2 py-2 font-medium">R</th>
              <th className="text-center px-2 py-2 font-medium">B</th>
              <th className="text-center px-2 py-2 font-medium">4s</th>
              <th className="text-center px-2 py-2 font-medium">6s</th>
              <th className="text-center px-2 py-2 font-medium">SR</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((b) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 font-semibold text-foreground">{b.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{b.dismissal}</td>
                <td className="text-center px-2 py-2.5 font-bold text-foreground">{b.runs}</td>
                <td className="text-center px-2 py-2.5 text-muted-foreground">{b.balls}</td>
                <td className="text-center px-2 py-2.5 text-muted-foreground">{b.fours}</td>
                <td className="text-center px-2 py-2.5 text-muted-foreground">{b.sixes}</td>
                <td className="text-center px-2 py-2.5 text-primary font-medium">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function BowlingTable({ title, entries, delay }: { title: string; entries: any[]; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
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
            {entries.map((b) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 font-semibold text-foreground">{b.name}</td>
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
  );
}

function SquadPanel({ label, members, getPlayerName, getPlayerRole }: {
  label: string;
  members: { id: string; playerId: string; isCaptain?: boolean; isWicketKeeper?: boolean }[];
  getPlayerName: (id: string) => string;
  getPlayerRole: (id: string) => string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <h4 className="font-heading text-sm font-bold text-foreground">{label}</h4>
      </div>
      <div className="divide-y divide-border/50">
        {members.map((mp, i) => (
          <div key={mp.id} className="px-5 py-2.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
            <span className="text-sm font-medium text-foreground">{getPlayerName(mp.playerId)}</span>
            <span className="text-xs text-muted-foreground">({getPlayerRole(mp.playerId)})</span>
            {mp.isCaptain && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">C</span>}
            {mp.isWicketKeeper && <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">WK</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AutoBattingTable({ title, entries, getPlayerName, striker, delay }: {
  title: string;
  entries: import("@/lib/scoreCalculator").BatterStats[];
  getPlayerName: (id: string) => string;
  striker?: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
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
            {entries.map((b) => (
              <tr key={b.playerId} className={`border-b border-border/50 transition-colors ${b.playerId === striker ? "bg-primary/5" : b.isOut ? "opacity-60" : ""}`}>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {getPlayerName(b.playerId)}
                  {b.playerId === striker && <span className="text-primary ml-1">*</span>}
                  {b.isOut && <span className="text-destructive text-xs ml-1">(out)</span>}
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
  );
}

function AutoBowlingTable({ title, entries, getPlayerName, currentBowler, delay }: {
  title: string;
  entries: import("@/lib/scoreCalculator").BowlerStats[];
  getPlayerName: (id: string) => string;
  currentBowler?: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
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
            {entries.map((b) => (
              <tr key={b.playerId} className={`border-b border-border/50 transition-colors ${b.playerId === currentBowler ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {getPlayerName(b.playerId)}
                  {b.playerId === currentBowler && <span className="text-primary ml-1">*</span>}
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
  );
}
