import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Match, Player, NewsItem, BattingEntry, BowlingEntry, BallData, MatchPlayer, PhotoItem, AboutData, AboutSkill, AboutCertification } from "@/types/cricket";

const SEED_MATCHES: Match[] = [
  { id: "1", teamA: "SRP Super Kings", teamB: "Royal Challengers", date: "2026-02-20", status: "upcoming", venue: "SRP Stadium" },
  { id: "2", teamA: "SRP Super Kings", teamB: "Mumbai Warriors", date: "2026-02-15", status: "completed", venue: "SRP Stadium", scoreA: "185/4", scoreB: "170/8", oversA: "20", oversB: "20", result: "SRP Super Kings won by 15 runs" },
  { id: "3", teamA: "SRP Super Kings", teamB: "Delhi Capitals", date: "2026-02-18", status: "live", venue: "SRP Stadium", scoreA: "142/3", oversA: "16.2" },
];

const SEED_PLAYERS: Player[] = [
  { id: "1", name: "Murali", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "2", name: "Sanju", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "3", name: "Sravan", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "4", name: "Sampat", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "5", name: "Birla", role: "Bowler", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "6", name: "Shiva", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "7", name: "Laddu", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "8", name: "Surya", role: "Bowler", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "9", name: "Vamsi", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "10", name: "Praveen", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "11", name: "C K", role: "Bowler", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "12", name: "Abhail", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "13", name: "Govindha", role: "Bowler", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "14", name: "Manigada", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "15", name: "Vinu", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "16", name: "Mahesh", role: "Bowler", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "17", name: "Madhu", role: "Wicket Keeper", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "18", name: "Charan", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "19", name: "Pavan Kalyan", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "20", name: "C Charan", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "21", name: "Chinnu", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
  { id: "22", name: "Babulu", role: "All-rounder", matches: 0, runs: 0, wickets: 0, strikeRate: 0 },
];

const SEED_NEWS: NewsItem[] = [
  { id: "1", title: "SRP Super Kings Crush Mumbai Warriors!", description: "In a dominant display, SRP Super Kings secured a 15-run victory at home. Rajesh Kumar led with a blistering 78 off 42 balls.", date: "2026-02-15" },
  { id: "2", title: "New Season Squad Announced", description: "The management has announced the squad for the upcoming season with exciting new additions to the roster.", date: "2026-02-10" },
  { id: "3", title: "Training Camp Begins at SRP Stadium", description: "The team has kicked off pre-season training with intense fitness and net sessions at the state-of-the-art SRP Stadium.", date: "2026-02-05" },
];

const SEED_BATTING: BattingEntry[] = [
  { id: "b1", matchId: "2", team: "A", name: "Rajesh Kumar", dismissal: "c Kohli b Bumrah", runs: 78, balls: 42, fours: 8, sixes: 4 },
  { id: "b2", matchId: "2", team: "A", name: "Suresh Raina", dismissal: "b Siraj", runs: 45, balls: 30, fours: 5, sixes: 2 },
  { id: "b3", matchId: "2", team: "A", name: "Vikram Singh", dismissal: "not out", runs: 38, balls: 28, fours: 3, sixes: 1 },
  { id: "b4", matchId: "2", team: "A", name: "Karthik Nair", dismissal: "run out", runs: 12, balls: 10, fours: 1, sixes: 0 },
  { id: "b5", matchId: "2", team: "B", name: "Virat Kohli", dismissal: "c Nair b Chahar", runs: 55, balls: 38, fours: 6, sixes: 2 },
  { id: "b6", matchId: "2", team: "B", name: "Rohit Sharma", dismissal: "b Patel", runs: 32, balls: 25, fours: 4, sixes: 1 },
];

const SEED_BOWLING: BowlingEntry[] = [
  { id: "w1", matchId: "2", team: "B", name: "Jasprit Bumrah", overs: 4, runs: 32, wickets: 1, economy: 8.0, dots: 10 },
  { id: "w2", matchId: "2", team: "B", name: "Mohammed Siraj", overs: 4, runs: 38, wickets: 1, economy: 9.5, dots: 8 },
  { id: "w3", matchId: "2", team: "A", name: "Deepak Chahar", overs: 4, runs: 28, wickets: 2, economy: 7.0, dots: 12 },
  { id: "w4", matchId: "2", team: "A", name: "Arun Patel", overs: 4, runs: 35, wickets: 1, economy: 8.75, dots: 9 },
];

const SEED_BALLS: BallData[] = [
  { id: "bl1", matchId: "2", innings: "A", over: 1, ball: 1, result: "0" },
  { id: "bl2", matchId: "2", innings: "A", over: 1, ball: 2, result: "4" },
  { id: "bl3", matchId: "2", innings: "A", over: 1, ball: 3, result: "1" },
  { id: "bl4", matchId: "2", innings: "A", over: 1, ball: 4, result: "6" },
  { id: "bl5", matchId: "2", innings: "A", over: 1, ball: 5, result: "0" },
  { id: "bl6", matchId: "2", innings: "A", over: 1, ball: 6, result: "2" },
  { id: "bl7", matchId: "2", innings: "A", over: 2, ball: 1, result: "W" },
  { id: "bl8", matchId: "2", innings: "A", over: 2, ball: 2, result: "0" },
  { id: "bl9", matchId: "2", innings: "A", over: 2, ball: 3, result: "4" },
  { id: "bl10", matchId: "2", innings: "A", over: 2, ball: 4, result: "1" },
  { id: "bl11", matchId: "2", innings: "A", over: 2, ball: 5, result: "1" },
  { id: "bl12", matchId: "2", innings: "A", over: 2, ball: 6, result: "6" },
];

const SEED_MATCH_PLAYERS: MatchPlayer[] = [];
const SEED_PHOTOS: PhotoItem[] = [];

const SEED_ABOUT: AboutData = {
  bio: "Transforming ideas into intelligent solutions — securing systems, one command at a time.",
  tagline: "Transforming ideas into intelligent solutions — securing systems, one command at a time.",
  skills: [
    { id: "s1", category: "IT Infrastructure & System Admin", label: "Windows Server / Linux", value: 90 },
    { id: "s2", category: "IT Infrastructure & System Admin", label: "Active Directory & GPO", value: 85 },
    { id: "s3", category: "IT Infrastructure & System Admin", label: "Virtualization (Proxmox)", value: 80 },
    { id: "s4", category: "Network Administration", label: "DNS, DHCP, Routing", value: 85 },
    { id: "s5", category: "Network Administration", label: "FortiGate Firewall & VPN", value: 78 },
    { id: "s6", category: "Network Administration", label: "Network Troubleshooting", value: 82 },
    { id: "s7", category: "Cloud & DevOps", label: "AWS / Azure / GCP", value: 75 },
    { id: "s8", category: "Cloud & DevOps", label: "Infrastructure as Code", value: 65 },
    { id: "s9", category: "Cloud & DevOps", label: "CI/CD Pipelines", value: 60 },
    { id: "s10", category: "Programming", label: "Python", value: 85 },
    { id: "s11", category: "Programming", label: "Web Development", value: 70 },
    { id: "s12", category: "Programming", label: "Bash / PowerShell", value: 75 },
    { id: "s13", category: "AI & Machine Learning", label: "Deep Learning", value: 72 },
    { id: "s14", category: "AI & Machine Learning", label: "Data Analysis", value: 78 },
    { id: "s15", category: "AI & Machine Learning", label: "ML Frameworks", value: 70 },
    { id: "s16", category: "Security & SIEM", label: "Splunk & Wazuh", value: 75 },
    { id: "s17", category: "Security & SIEM", label: "Ethical Hacking", value: 65 },
    { id: "s18", category: "Security & SIEM", label: "Incident Response", value: 60 },
  ],
  certifications: [
    { id: "c1", name: "AWS Cloud Quest", org: "Amazon Web Services" },
    { id: "c2", name: "Python for Data Science", org: "IBM" },
    { id: "c3", name: "CCNA v7", org: "Cisco" },
    { id: "c4", name: "IBM Skills Build Internship", org: "IBM" },
    { id: "c5", name: "Microsoft AZ-104", org: "Microsoft" },
    { id: "c6", name: "Microsoft AZ-900", org: "Microsoft" },
    { id: "c7", name: "Cisco Cybersecurity", org: "Cisco" },
  ],
};

interface DataContextType {
  matches: Match[];
  players: Player[];
  news: NewsItem[];
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  balls: BallData[];
  matchPlayers: MatchPlayer[];
  photos: PhotoItem[];
  addMatch: (m: Omit<Match, "id">) => void;
  updateMatch: (m: Match) => void;
  deleteMatch: (id: string) => void;
  addPlayer: (p: Omit<Player, "id">) => void;
  updatePlayer: (p: Player) => void;
  deletePlayer: (id: string) => void;
  addNews: (n: Omit<NewsItem, "id">) => void;
  updateNews: (n: NewsItem) => void;
  deleteNews: (id: string) => void;
  addBatting: (b: Omit<BattingEntry, "id">) => void;
  updateBatting: (b: BattingEntry) => void;
  deleteBatting: (id: string) => void;
  addBowling: (b: Omit<BowlingEntry, "id">) => void;
  updateBowling: (b: BowlingEntry) => void;
  deleteBowling: (id: string) => void;
  addBall: (b: Omit<BallData, "id">) => void;
  updateBall: (b: BallData) => void;
  deleteBall: (id: string) => void;
  addMatchPlayer: (mp: Omit<MatchPlayer, "id">) => void;
  updateMatchPlayer: (mp: MatchPlayer) => void;
  deleteMatchPlayer: (id: string) => void;
  addPhoto: (p: Omit<PhotoItem, "id">) => void;
  deletePhoto: (id: string) => void;
  aboutData: AboutData;
  updateAboutData: (data: AboutData) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const DATA_VERSION = "v6"; // bump to force refresh seed data

function load<T>(key: string, seed: T): T {
  const versionKey = key + "_version";
  const storedVersion = localStorage.getItem(versionKey);
  if (storedVersion === DATA_VERSION) {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(seed));
  localStorage.setItem(versionKey, DATA_VERSION);
  return seed;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(() => load("srp_matches", SEED_MATCHES));
  const [players, setPlayers] = useState<Player[]>(() => load("srp_players", SEED_PLAYERS));
  const [news, setNews] = useState<NewsItem[]>(() => load("srp_news", SEED_NEWS));
  const [batting, setBatting] = useState<BattingEntry[]>(() => load("srp_batting", SEED_BATTING));
  const [bowling, setBowling] = useState<BowlingEntry[]>(() => load("srp_bowling", SEED_BOWLING));
  const [balls, setBalls] = useState<BallData[]>(() => load("srp_balls", SEED_BALLS));
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>(() => load("srp_match_players", SEED_MATCH_PLAYERS));
  const [photos, setPhotos] = useState<PhotoItem[]>(() => load("srp_photos", SEED_PHOTOS));
  const [aboutData, setAboutData] = useState<AboutData>(() => load("srp_about", SEED_ABOUT));

  useEffect(() => localStorage.setItem("srp_matches", JSON.stringify(matches)), [matches]);
  useEffect(() => localStorage.setItem("srp_players", JSON.stringify(players)), [players]);
  useEffect(() => localStorage.setItem("srp_news", JSON.stringify(news)), [news]);
  useEffect(() => localStorage.setItem("srp_batting", JSON.stringify(batting)), [batting]);
  useEffect(() => localStorage.setItem("srp_bowling", JSON.stringify(bowling)), [bowling]);
  useEffect(() => localStorage.setItem("srp_balls", JSON.stringify(balls)), [balls]);
  useEffect(() => localStorage.setItem("srp_match_players", JSON.stringify(matchPlayers)), [matchPlayers]);
  useEffect(() => localStorage.setItem("srp_photos", JSON.stringify(photos)), [photos]);
  useEffect(() => localStorage.setItem("srp_about", JSON.stringify(aboutData)), [aboutData]);

  // Cross-tab sync: listen for localStorage changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        switch (e.key) {
          case "srp_matches": setMatches(data); break;
          case "srp_players": setPlayers(data); break;
          case "srp_news": setNews(data); break;
          case "srp_batting": setBatting(data); break;
          case "srp_bowling": setBowling(data); break;
          case "srp_balls": setBalls(data); break;
          case "srp_match_players": setMatchPlayers(data); break;
          case "srp_photos": setPhotos(data); break;
          case "srp_about": setAboutData(data); break;
        }
      } catch {}
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  const value: DataContextType = {
    matches, players, news, batting, bowling, balls, matchPlayers, photos, aboutData,
    addMatch: (m) => setMatches((p) => [...p, { ...m, id: uid() }]),
    updateMatch: (m) => setMatches((p) => p.map((x) => (x.id === m.id ? m : x))),
    deleteMatch: (id) => {
      setMatches((p) => p.filter((x) => x.id !== id));
      setBatting((p) => p.filter((x) => x.matchId !== id));
      setBowling((p) => p.filter((x) => x.matchId !== id));
      setBalls((p) => p.filter((x) => x.matchId !== id));
      setMatchPlayers((p) => p.filter((x) => x.matchId !== id));
    },
    addPlayer: (pl) => setPlayers((p) => [...p, { ...pl, id: uid() }]),
    updatePlayer: (pl) => setPlayers((p) => p.map((x) => (x.id === pl.id ? pl : x))),
    deletePlayer: (id) => setPlayers((p) => p.filter((x) => x.id !== id)),
    addNews: (n) => setNews((p) => [{ ...n, id: uid() }, ...p]),
    updateNews: (n) => setNews((p) => p.map((x) => (x.id === n.id ? n : x))),
    deleteNews: (id) => setNews((p) => p.filter((x) => x.id !== id)),
    addBatting: (b) => setBatting((p) => [...p, { ...b, id: uid() }]),
    updateBatting: (b) => setBatting((p) => p.map((x) => (x.id === b.id ? b : x))),
    deleteBatting: (id) => setBatting((p) => p.filter((x) => x.id !== id)),
    addBowling: (b) => setBowling((p) => [...p, { ...b, id: uid() }]),
    updateBowling: (b) => setBowling((p) => p.map((x) => (x.id === b.id ? b : x))),
    deleteBowling: (id) => setBowling((p) => p.filter((x) => x.id !== id)),
    addBall: (b) => setBalls((p) => [...p, { ...b, id: uid() }]),
    updateBall: (b) => setBalls((p) => p.map((x) => (x.id === b.id ? b : x))),
    deleteBall: (id) => setBalls((p) => p.filter((x) => x.id !== id)),
    addMatchPlayer: (mp) => setMatchPlayers((p) => [...p, { ...mp, id: uid() }]),
    updateMatchPlayer: (mp) => setMatchPlayers((p) => p.map((x) => (x.id === mp.id ? mp : x))),
    deleteMatchPlayer: (id) => setMatchPlayers((p) => p.filter((x) => x.id !== id)),
    addPhoto: (ph) => setPhotos((p) => [{ ...ph, id: uid() }, ...p]),
    deletePhoto: (id) => setPhotos((p) => p.filter((x) => x.id !== id)),
    updateAboutData: (data) => setAboutData(data),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
