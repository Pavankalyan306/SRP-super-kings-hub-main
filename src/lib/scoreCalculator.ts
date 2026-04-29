import { BallData } from "@/types/cricket";

export function calculateInningsScore(balls: BallData[], innings: "A" | "B") {
  const inningsBalls = balls.filter((b) => b.innings === innings);
  
  let totalRuns = 0;
  let wickets = 0;
  let legalBalls = 0;

  inningsBalls.forEach((b) => {
    const r = b.result;
    if (["0", "1", "2", "3", "4", "5", "6"].includes(r)) {
      totalRuns += parseInt(r);
      legalBalls++;
    } else if (r === "WD" || r === "NB") {
      totalRuns += 1;
    } else if (r === "LB" || r === "B") {
      legalBalls++;
      totalRuns += 1;
    } else if (r === "W") {
      legalBalls++;
    }
    if (b.wicket || r === "W") wickets++;
  });

  const completedOvers = Math.floor(legalBalls / 6);
  const remainingBalls = legalBalls % 6;
  const oversStr = remainingBalls > 0 ? `${completedOvers}.${remainingBalls}` : `${completedOvers}`;

  return {
    score: `${totalRuns}/${wickets}`,
    overs: oversStr,
    totalRuns,
    wickets,
    legalBalls,
  };
}

export function getLastCompletedOver(balls: BallData[], innings: "A" | "B") {
  const inningsBalls = balls.filter((b) => b.innings === innings);
  if (inningsBalls.length === 0) return 0;
  return Math.max(...inningsBalls.map((b) => b.over));
}

export function getNextBallInfo(balls: BallData[], innings: "A" | "B") {
  const inningsBalls = balls
    .filter((b) => b.innings === innings)
    .sort((a, b) => a.over - b.over || a.ball - b.ball);

  if (inningsBalls.length === 0) return { over: 1, ball: 1 };

  const currentOver = Math.max(...inningsBalls.map((b) => b.over));
  const currentOverBalls = inningsBalls.filter((b) => b.over === currentOver);
  const legalBallsInOver = currentOverBalls.filter((b) => !["WD", "NB"].includes(b.result)).length;

  if (legalBallsInOver >= 6) {
    return { over: currentOver + 1, ball: 1 };
  }

  return { over: currentOver, ball: legalBallsInOver + 1 };
}

/** Check if an over just completed (last legal ball was ball 6) */
export function isOverComplete(balls: BallData[], innings: "A" | "B") {
  const inningsBalls = balls
    .filter((b) => b.innings === innings)
    .sort((a, b) => a.over - b.over || a.ball - b.ball);
  if (inningsBalls.length === 0) return false;
  const last = inningsBalls[inningsBalls.length - 1];
  if (last.result === "WD" || last.result === "NB") return false;
  return last.ball >= 6;
}

/** Get current over number being bowled */
export function getCurrentOver(balls: BallData[], innings: "A" | "B") {
  const next = getNextBallInfo(balls, innings);
  return next.over;
}

export interface BatterStats {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal: string;
}

export interface BowlerStats {
  playerId: string;
  overs: string;
  legalBalls: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

/** Calculate batting stats for all batters in an innings from ball data */
export function calculateBattingStats(balls: BallData[], innings: "A" | "B"): BatterStats[] {
  const inningsBalls = balls.filter((b) => b.innings === innings);
  const statsMap: Record<string, BatterStats> = {};

  inningsBalls.forEach((b) => {
    if (!b.batter) return;
    if (!statsMap[b.batter]) {
      statsMap[b.batter] = {
        playerId: b.batter,
        runs: 0, balls: 0, fours: 0, sixes: 0,
        strikeRate: 0, isOut: false, dismissal: "not out",
      };
    }
    const s = statsMap[b.batter];
    const r = b.result;

    if (["0", "1", "2", "3", "4", "5", "6"].includes(r)) {
      const val = parseInt(r);
      s.runs += val;
      s.balls++;
      if (val === 4) s.fours++;
      if (val === 6) s.sixes++;
    } else if (r === "W") {
      s.balls++;
    } else if (r === "WD" || r === "NB") {
      // extras don't count as batter's ball
    } else if (r === "LB" || r === "B") {
      s.balls++;
      // runs go to team extras, not batter
    }

    if ((b.wicket || r === "W") && (b.dismissedPlayer || b.batter) === b.batter) {
      s.isOut = true;
      s.dismissal = b.dismissalType === "run_out" ? "run out" : "out";
    }
  });

  inningsBalls.forEach((b) => {
    const dismissed = b.dismissedPlayer;
    if (!dismissed || dismissed === b.batter || !b.wicket) return;
    if (!statsMap[dismissed]) {
      statsMap[dismissed] = {
        playerId: dismissed,
        runs: 0, balls: 0, fours: 0, sixes: 0,
        strikeRate: 0, isOut: true, dismissal: "run out",
      };
    } else {
      statsMap[dismissed].isOut = true;
      statsMap[dismissed].dismissal = "run out";
    }
  });

  return Object.values(statsMap).map((s) => ({
    ...s,
    strikeRate: s.balls > 0 ? (s.runs / s.balls) * 100 : 0,
  }));
}

/** Calculate bowling stats for all bowlers in an innings from ball data */
export function calculateBowlingStats(balls: BallData[], innings: "A" | "B"): BowlerStats[] {
  const inningsBalls = balls.filter((b) => b.innings === innings);
  const statsMap: Record<string, BowlerStats> = {};

  inningsBalls.forEach((b) => {
    if (!b.bowler) return;
    if (!statsMap[b.bowler]) {
      statsMap[b.bowler] = {
        playerId: b.bowler,
        overs: "0",
        legalBalls: 0,
        runs: 0, wickets: 0, economy: 0, dots: 0,
      };
    }
    const s = statsMap[b.bowler];
    const r = b.result;

    if (["0", "1", "2", "3", "4", "5", "6"].includes(r)) {
      const val = parseInt(r);
      s.runs += val;
      s.legalBalls++;
      if (val === 0) s.dots++;
    } else if (r === "W") {
      s.legalBalls++;
      s.dots++;
    } else if (r === "WD" || r === "NB") {
      s.runs += 1;
    } else if (r === "LB" || r === "B") {
      s.legalBalls++;
      s.runs += 1;
    }

    if ((b.wicket || r === "W") && b.dismissalType !== "run_out") {
      s.wickets++;
    }
  });

  return Object.values(statsMap).map((s) => {
    const completedOvers = Math.floor(s.legalBalls / 6);
    const remBalls = s.legalBalls % 6;
    const oversStr = remBalls > 0 ? `${completedOvers}.${remBalls}` : `${completedOvers}`;
    const totalOvers = s.legalBalls / 6;
    return {
      ...s,
      overs: oversStr,
      economy: totalOvers > 0 ? s.runs / totalOvers : 0,
    };
  });
}
