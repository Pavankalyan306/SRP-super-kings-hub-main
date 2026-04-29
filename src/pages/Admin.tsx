import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/hooks/useMatches";
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from "@/hooks/usePlayers";
import { uploadPlayerProfileImage, deletePlayerProfileImage } from "@/lib/players";
import { toast } from "@/hooks/use-toast";
import { Match, Player, NewsItem } from "@/types/cricket";
import { motion } from "framer-motion";
import { LogOut, Plus, Pencil, Trash2, Trophy, Users, Newspaper, Activity, TrendingUp, ClipboardList, UserPlus, Zap, Image, User, Play } from "lucide-react";
import ScorecardAdmin from "@/components/admin/ScorecardAdmin";
import AboutAdmin from "@/components/admin/AboutAdmin";
import TeamAdmin from "@/components/admin/TeamAdmin";
import LiveScoringAdmin from "@/components/admin/LiveScoringAdmin";
import PhotosAdmin from "@/components/admin/PhotosAdmin";

type Tab = "matches" | "players" | "news" | "scorecard" | "teams" | "live" | "photos" | "about";

export default function Admin() {
  const { isAdmin, logout } = useAuth();
  const data = useData();
  const { data: dashboardMatches = [] } = useMatches();
  const { data: dashboardPlayers = [] } = usePlayers();
  const [tab, setTab] = useState<Tab>("matches");

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "live", label: "Live Scoring", icon: Zap },
    { key: "matches", label: "Matches", icon: Trophy },
    { key: "players", label: "Players", icon: Users },
    { key: "teams", label: "Teams", icon: UserPlus },
    { key: "news", label: "News", icon: Newspaper },
    { key: "scorecard", label: "Scorecard", icon: ClipboardList },
    { key: "photos", label: "Photos", icon: Image },
    { key: "about", label: "About Page", icon: User },
  ];

  const liveCount = dashboardMatches.filter((m) => m.status === "live").length;
  const upcomingCount = dashboardMatches.filter((m) => m.status === "upcoming").length;

  const kpis = [
    { label: "Live Matches", value: liveCount, icon: Activity, accent: liveCount > 0 ? "text-destructive" : "text-muted-foreground", pulse: liveCount > 0 },
    { label: "Total Matches", value: dashboardMatches.length, icon: Trophy, accent: "text-primary" },
    { label: "Total Players", value: dashboardPlayers.length, icon: Users, accent: "text-primary" },
    { label: "News Articles", value: data.news.length, icon: Newspaper, accent: "text-primary" },
    { label: "Upcoming", value: upcomingCount, icon: TrendingUp, accent: "text-accent" },
  ];

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gradient-gold">Admin Dashboard</h1>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* KPI Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-lg p-4 flex flex-col items-center text-center card-hover"
          >
            <kpi.icon className={`w-5 h-5 mb-2 ${kpi.accent} ${kpi.pulse ? "animate-pulse" : ""}`} />
            <span className="font-heading text-2xl font-bold text-foreground">{kpi.value}</span>
            <span className="text-xs text-muted-foreground mt-1">{kpi.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "live" && <LiveScoringAdmin />}
      {tab === "matches" && <MatchesAdmin />}
      {tab === "players" && <PlayersAdmin />}
      {tab === "teams" && <TeamAdmin />}
      {tab === "news" && <NewsAdmin />}
      {tab === "scorecard" && <ScorecardAdmin />}
      {tab === "photos" && <PhotosAdmin />}
      {tab === "about" && <AboutAdmin />}
    </div>
  );
}

/* ---- Matches Admin ---- */
function MatchesAdmin() {
  // Use Supabase hooks for database operations
  const { data: matches = [], isLoading } = useMatches();
  const { mutate: createMatch } = useCreateMatch();
  const { mutate: updateMatch } = useUpdateMatch();
  const { mutate: deleteMatch } = useDeleteMatch();
  
  const [editing, setEditing] = useState<Match | null>(null);
  const [adding, setAdding] = useState(false);

  const empty: Omit<Match, "id"> = { teamA: "", teamB: "", date: "", status: "upcoming", venue: "", scoreA: "", scoreB: "", oversA: "", oversB: "", result: "" };
  const [form, setForm] = useState<any>(empty);

  const startAdd = () => { setForm(empty); setAdding(true); setEditing(null); };
  const startEdit = (m: Match) => { setForm(m); setEditing(m); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };

  const save = () => {
    if (!form.teamA || !form.teamB || !form.date) return;
    if (editing) { 
      updateMatch(
        { matchId: form.id, updates: form },
        {
          onSuccess: () => toast({ title: "Match updated", description: "Match saved successfully." }),
          onError: () => toast({ title: "Save failed", description: "Could not update match.", variant: "destructive" }),
        }
      );
    } else { 
      createMatch(
        form,
        {
          onSuccess: () => toast({ title: "Match created", description: "Match saved successfully." }),
          onError: () => toast({ title: "Save failed", description: "Could not create match.", variant: "destructive" }),
        }
      );
    }
    cancel();
  };

  const startMatch = (match: Match) => {
    updateMatch(
      { matchId: match.id, updates: { status: "live" } },
      {
        onSuccess: () => toast({ title: "Match started", description: "Public users will be notified." }),
        onError: () => toast({ title: "Start failed", description: "Could not start match.", variant: "destructive" }),
      }
    );
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-6 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Match
      </button>

      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Team A" value={form.teamA} onChange={(v) => setForm({ ...form, teamA: v })} />
            <Field label="Team B" value={form.teamB} onChange={(v) => setForm({ ...form, teamB: v })} />
            <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <Field label="Venue" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
            <Field label="Score A" value={form.scoreA || ""} onChange={(v) => setForm({ ...form, scoreA: v })} placeholder="e.g. 185/4" />
            <Field label="Score B" value={form.scoreB || ""} onChange={(v) => setForm({ ...form, scoreB: v })} placeholder="e.g. 170/8" />
            <Field label="Overs A" value={form.oversA || ""} onChange={(v) => setForm({ ...form, oversA: v })} />
            <Field label="Overs B" value={form.oversB || ""} onChange={(v) => setForm({ ...form, oversB: v })} />
            <Field label="Result" value={form.result || ""} onChange={(v) => setForm({ ...form, result: v })} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
            <button onClick={cancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Loading matches...</p>
        ) : matches.length === 0 ? (
          <p className="text-muted-foreground">No matches yet</p>
        ) : (
          matches.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold text-foreground">{m.teamA} vs {m.teamB}</p>
                <p className="text-xs text-muted-foreground">{m.date} · {m.status}</p>
              </div>
              <div className="flex gap-2">
                {m.status === "upcoming" && (
                  <button
                    onClick={() => startMatch(m)}
                    className="flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                )}
                <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteMatch(m.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---- Players Admin ---- */
/* ---- Players Admin ---- */
function PlayersAdmin() {
  // Use Supabase hooks for database operations
  const { data: players = [], isLoading } = usePlayers();
  const { mutateAsync: createPlayer } = useCreatePlayer();
  const { mutateAsync: updatePlayer } = useUpdatePlayer();
  const { mutate: deletePlayer } = useDeletePlayer();
  
  // Get match data from DataContext (for stats computation)
  const { balls, matchPlayers, matches } = useData();
  
  const [editing, setEditing] = useState<Player | null>(null);
  const [adding, setAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const empty: Omit<Player, "id"> = { name: "", role: "Batsman", matches: 0, runs: 0, wickets: 0, strikeRate: 0, image: "", jerseyNumber: 0 };
  const [form, setForm] = useState<any>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const startAdd = () => { setForm(empty); setImageFile(null); setAdding(true); setEditing(null); };
  const startEdit = (p: Player) => { setForm(p); setImageFile(null); setEditing(p); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); setImageFile(null); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, image: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name) return;
    setIsSaving(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        if (editing?.image) {
          await deletePlayerProfileImage(editing.image);
        }
        const uploadResult = await uploadPlayerProfileImage(imageFile);
        if (!uploadResult.success || !uploadResult.url) {
          toast({ title: "Image upload failed", description: uploadResult.error || "Failed to upload player image", variant: "destructive" });
          return;
        }
        imageUrl = uploadResult.url;
      }

      const payload = { ...form, image: imageUrl };

      if (editing) {
        const response = await updatePlayer({ playerId: form.id, updates: payload });
        if (response?.error) {
          toast({ title: "Save failed", description: response.error, variant: "destructive" });
          return;
        }
        toast({ title: "Player updated", description: "Player saved successfully." });
      } else {
        const response = await createPlayer(payload);
        if (response?.error) {
          toast({ title: "Save failed", description: response.error, variant: "destructive" });
          return;
        }
        toast({ title: "Player created", description: "Player saved successfully." });
      }

      setImageFile(null);
      cancel();
    } finally {
      setIsSaving(false);
    }
  };

  const removePlayerImage = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      if (editing.image) {
        const deleteResult = await deletePlayerProfileImage(editing.image);
        if (!deleteResult.success) {
          toast({ title: "Remove failed", description: deleteResult.error || "Could not delete image from storage", variant: "destructive" });
          return;
        }
      }
      const response = await updatePlayer({ playerId: editing.id, updates: { image: "" } });
      if (response?.error) {
        toast({ title: "Remove failed", description: response.error, variant: "destructive" });
        return;
      }
      setForm({ ...form, image: "" });
      setImageFile(null);
      setEditing({ ...editing, image: "" });
      toast({ title: "Image removed", description: "Player image removed successfully." });
    } finally {
      setIsSaving(false);
    }
  };

  /** Compute stats dynamically from ball data — only for existing matches */
  const getPlayerStats = (playerId: string) => {
    if (matches.length === 0) return { runs: 0, wickets: 0, matches: 0 };

    const validMatchIds = new Set(matches.map((m) => m.id));
    const validBalls = balls.filter((b) => validMatchIds.has(b.matchId));
    const batterBalls = validBalls.filter((b) => b.batter === playerId);
    const bowlerBalls = validBalls.filter((b) => b.bowler === playerId);
    let runs = 0, ballsFaced = 0, wickets = 0;
    batterBalls.forEach((b) => {
      const r = b.result;
      if (["0","1","2","3","4","6"].includes(r)) { runs += parseInt(r); ballsFaced++; }
      else if (r === "W" || r === "LB" || r === "B") { ballsFaced++; }
    });
    bowlerBalls.forEach((b) => {
      if (b.result === "W") wickets++;
    });
    const matchIds = new Set([
      ...batterBalls.map((b) => b.matchId),
      ...bowlerBalls.map((b) => b.matchId),
      ...matchPlayers.filter((mp) => mp.playerId === playerId && validMatchIds.has(mp.matchId)).map((mp) => mp.matchId),
    ]);
    return { runs, wickets, matches: matchIds.size };
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-6 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Player
      </button>

      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option>Batsman</option>
                <option>Bowler</option>
                <option>All-rounder</option>
                <option>Wicket Keeper</option>
              </select>
            </div>
            <Field label="Jersey #" value={form.jerseyNumber || ""} onChange={(v) => setForm({ ...form, jerseyNumber: Number(v) })} type="number" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Player Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:text-xs file:cursor-pointer" />
              {form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={form.image} alt="Player preview" className="w-12 h-12 rounded-full object-cover border border-border" />
                  <button
                    type="button"
                    onClick={removePlayerImage}
                    disabled={isSaving}
                    className="text-xs bg-destructive/15 text-destructive px-2.5 py-1 rounded hover:bg-destructive/25 transition-colors disabled:opacity-50"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">Stats (runs, wickets, matches) are calculated automatically from match data.</p>
          <div className="flex gap-2">
            <button onClick={save} disabled={isSaving} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            <button onClick={cancel} disabled={isSaving} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Loading players...</p>
        ) : players.length === 0 ? (
          <p className="text-muted-foreground">No players yet</p>
        ) : (
          players.map((p) => {
            const stats = getPlayerStats(p.id);
            return (
              <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {p.image ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-secondary" />}
                  <div>
                    <p className="font-heading font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role} · {stats.matches}M · {stats.runs}R · {stats.wickets}W</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deletePlayer(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---- News Admin ---- */
function NewsAdmin() {
  const { news, addNews, updateNews, deleteNews } = useData();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [adding, setAdding] = useState(false);

  const empty: Omit<NewsItem, "id"> = { title: "", description: "", date: new Date().toISOString().slice(0, 10), image: "" };
  const [form, setForm] = useState<any>(empty);

  const startAdd = () => { setForm(empty); setAdding(true); setEditing(null); };
  const startEdit = (n: NewsItem) => { setForm(n); setEditing(n); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, image: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.title) return;
    if (editing) {
      updateNews({ ...form });
      toast({ title: "News updated", description: "News saved successfully." });
    }
    else {
      addNews(form);
      toast({ title: "News created", description: "News saved successfully." });
    }
    cancel();
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-6 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add News
      </button>

      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:text-xs file:cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
            <button onClick={cancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {news.map((n) => (
          <div key={n.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.date}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(n)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteNews(n.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Shared Field Component ---- */
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
