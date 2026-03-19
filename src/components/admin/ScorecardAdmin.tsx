import { useState } from "react";
import { useData } from "@/context/DataContext";
import { BattingEntry, BowlingEntry, BallData } from "@/types/cricket";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}

export default function ScorecardAdmin() {
  const { matches, batting, bowling, balls, addBatting, updateBatting, deleteBatting, addBowling, updateBowling, deleteBowling, addBall, updateBall, deleteBall } = useData();
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || "");
  const [section, setSection] = useState<"batting" | "bowling" | "balls">("batting");

  const scorecardMatches = matches.filter((m) => m.status !== "upcoming");

  return (
    <div>
      {/* Match selector */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Select Match</label>
          <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)}
            className="bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm min-w-[220px]">
            {scorecardMatches.map((m) => (
              <option key={m.id} value={m.id}>{m.teamA} vs {m.teamB} ({m.date})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 mt-4">
          {(["batting", "bowling", "balls"] as const).map((s) => (
            <button key={s} onClick={() => setSection(s)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${section === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {section === "batting" && <BattingSection matchId={selectedMatchId} />}
      {section === "bowling" && <BowlingSection matchId={selectedMatchId} />}
      {section === "balls" && <BallsSection matchId={selectedMatchId} />}
    </div>
  );
}

function BattingSection({ matchId }: { matchId: string }) {
  const { batting, addBatting, updateBatting, deleteBatting } = useData();
  const entries = batting.filter((b) => b.matchId === matchId);
  const [editing, setEditing] = useState<BattingEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const empty: Omit<BattingEntry, "id"> = { matchId, team: "A", name: "", dismissal: "", runs: 0, balls: 0, fours: 0, sixes: 0 };
  const [form, setForm] = useState<any>(empty);

  const startAdd = () => { setForm({ ...empty, matchId }); setAdding(true); setEditing(null); };
  const startEdit = (b: BattingEntry) => { setForm(b); setEditing(b); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };
  const save = () => {
    if (!form.name) return;
    if (editing) updateBatting({ ...form });
    else addBatting({ ...form, matchId });
    cancel();
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-4 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Batting Entry
      </button>
      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5 mb-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Batter Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Team</label>
              <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option value="A">Team A</option>
                <option value="B">Team B</option>
              </select>
            </div>
            <Field label="Dismissal" value={form.dismissal} onChange={(v) => setForm({ ...form, dismissal: v })} placeholder="e.g. c Kohli b Bumrah" />
            <Field label="Runs" value={form.runs} onChange={(v) => setForm({ ...form, runs: Number(v) })} type="number" />
            <Field label="Balls" value={form.balls} onChange={(v) => setForm({ ...form, balls: Number(v) })} type="number" />
            <Field label="4s" value={form.fours} onChange={(v) => setForm({ ...form, fours: Number(v) })} type="number" />
            <Field label="6s" value={form.sixes} onChange={(v) => setForm({ ...form, sixes: Number(v) })} type="number" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
            <button onClick={cancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
          </div>
        </motion.div>
      )}
      <div className="space-y-2">
        {entries.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">{b.name} <span className="text-muted-foreground text-xs">({b.team === "A" ? "Team A" : "Team B"})</span></p>
              <p className="text-xs text-muted-foreground">{b.runs}({b.balls}) · {b.fours}x4 · {b.sixes}x6 · {b.dismissal}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(b)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteBatting(b.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No batting entries for this match.</p>}
      </div>
    </div>
  );
}

function BowlingSection({ matchId }: { matchId: string }) {
  const { bowling, addBowling, updateBowling, deleteBowling } = useData();
  const entries = bowling.filter((b) => b.matchId === matchId);
  const [editing, setEditing] = useState<BowlingEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const empty: Omit<BowlingEntry, "id"> = { matchId, team: "A", name: "", overs: 0, runs: 0, wickets: 0, economy: 0, dots: 0 };
  const [form, setForm] = useState<any>(empty);

  const startAdd = () => { setForm({ ...empty, matchId }); setAdding(true); setEditing(null); };
  const startEdit = (b: BowlingEntry) => { setForm(b); setEditing(b); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };
  const save = () => {
    if (!form.name) return;
    if (editing) updateBowling({ ...form });
    else addBowling({ ...form, matchId });
    cancel();
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-4 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Bowling Entry
      </button>
      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5 mb-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Bowler Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Team</label>
              <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option value="A">Team A</option>
                <option value="B">Team B</option>
              </select>
            </div>
            <Field label="Overs" value={form.overs} onChange={(v) => setForm({ ...form, overs: Number(v) })} type="number" />
            <Field label="Runs" value={form.runs} onChange={(v) => setForm({ ...form, runs: Number(v) })} type="number" />
            <Field label="Wickets" value={form.wickets} onChange={(v) => setForm({ ...form, wickets: Number(v) })} type="number" />
            <Field label="Economy" value={form.economy} onChange={(v) => setForm({ ...form, economy: Number(v) })} type="number" />
            <Field label="Dot Balls" value={form.dots} onChange={(v) => setForm({ ...form, dots: Number(v) })} type="number" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
            <button onClick={cancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
          </div>
        </motion.div>
      )}
      <div className="space-y-2">
        {entries.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">{b.name} <span className="text-muted-foreground text-xs">({b.team === "A" ? "Team A" : "Team B"})</span></p>
              <p className="text-xs text-muted-foreground">{b.overs}ov · {b.runs}r · {b.wickets}w · Econ {b.economy} · {b.dots} dots</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(b)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => deleteBowling(b.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No bowling entries for this match.</p>}
      </div>
    </div>
  );
}

function BallsSection({ matchId }: { matchId: string }) {
  const { balls, addBall, updateBall, deleteBall } = useData();
  const entries = balls.filter((b) => b.matchId === matchId).sort((a, b) => a.over - b.over || a.ball - b.ball);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BallData | null>(null);
  const empty: Omit<BallData, "id"> = { matchId, innings: "A", over: 1, ball: 1, result: "0" };
  const [form, setForm] = useState<any>(empty);

  const startAdd = () => { setForm({ ...empty, matchId }); setAdding(true); setEditing(null); };
  const startEdit = (b: BallData) => { setForm(b); setEditing(b); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); };
  const save = () => {
    if (editing) updateBall({ ...form });
    else addBall({ ...form, matchId });
    cancel();
  };

  return (
    <div>
      <button onClick={startAdd} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-4 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Ball
      </button>
      {(adding || editing) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5 mb-4 space-y-4">
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Over" value={form.over} onChange={(v) => setForm({ ...form, over: Number(v) })} type="number" />
            <Field label="Ball" value={form.ball} onChange={(v) => setForm({ ...form, ball: Number(v) })} type="number" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Innings</label>
              <select value={form.innings} onChange={(e) => setForm({ ...form, innings: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                <option value="A">Innings A</option>
                <option value="B">Innings B</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Result</label>
              <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm">
                {["0","1","2","3","4","6","W","WD","NB"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
            <button onClick={cancel} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
          </div>
        </motion.div>
      )}
      <div className="flex flex-wrap gap-2">
        {entries.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Ov{b.over}.{b.ball}</span>
            <span className="font-bold text-foreground">{b.result}</span>
            <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3 h-3" /></button>
            <button onClick={() => deleteBall(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No ball data for this match.</p>}
      </div>
    </div>
  );
}
