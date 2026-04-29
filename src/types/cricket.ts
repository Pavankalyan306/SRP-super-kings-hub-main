export interface Match {
  id: string;
  teamAId?: string;
  teamBId?: string;
  teamA: string;
  teamB: string;
  date: string;
  status: "upcoming" | "live" | "completed";
  venue: string;
  scoreA?: string;
  scoreB?: string;
  oversA?: string;
  oversB?: string;
  result?: string;
  liveScoring?: boolean;
  currentInnings?: "A" | "B";
  striker?: string;
  nonStriker?: string;
  currentBowler?: string;
  lastBowler?: string;
  outBatsmen?: string[];
  totalOvers?: number;
  tossWinner?: "A" | "B";
  tossDecision?: "bat" | "bowl";
  tossCompleted?: boolean;
  inningsATeam?: string;
  inningsBTeam?: string;
}

export interface BattingEntry {
  id: string;
  matchId: string;
  team: "A" | "B";
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
}

export interface BowlingEntry {
  id: string;
  matchId: string;
  team: "A" | "B";
  name: string;
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

export interface BallData {
  id: string;
  matchId: string;
  innings: "A" | "B";
  over: number;
  ball: number;
  result: string;
  batter?: string;
  bowler?: string;
}

export interface Player {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket Keeper";
  image?: string;
  matches: number;
  runs: number;
  wickets: number;
  strikeRate: number;
  jerseyNumber?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  date: string;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  team: "A" | "B";
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
}

export interface PhotoItem {
  id: string;
  image: string;
  title?: string;
  matchTag?: string;
  date: string;
}

export interface PhotoRecord {
  id: string;
  match_id?: string;
  url: string;
  title?: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at?: string;
}

export interface AboutSkill {
  id: string;
  category: string;
  label: string;
  value: number;
}

export interface AboutCertification {
  id: string;
  name: string;
  org: string;
}

export interface AboutData {
  bio: string;
  tagline: string;
  skills: AboutSkill[];
  certifications: AboutCertification[];
}
