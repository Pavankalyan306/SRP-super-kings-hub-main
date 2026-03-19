import { useState } from "react";
import { useData } from "@/context/DataContext";
import { AboutSkill, AboutCertification } from "@/types/cricket";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function AboutAdmin() {
  const { aboutData, updateAboutData } = useData();
  const [bio, setBio] = useState(aboutData.bio);
  const [tagline, setTagline] = useState(aboutData.tagline);
  const [bioSaved, setBioSaved] = useState(false);

  // Skills
  const [editingSkill, setEditingSkill] = useState<AboutSkill | null>(null);
  const [addingSkill, setAddingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ category: "", label: "", value: 75 });

  // Certifications
  const [editingCert, setEditingCert] = useState<AboutCertification | null>(null);
  const [addingCert, setAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: "", org: "" });

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  const saveBio = () => {
    updateAboutData({ ...aboutData, bio, tagline });
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  };

  // ── Skills CRUD ──
  const startAddSkill = () => {
    setSkillForm({ category: "", label: "", value: 75 });
    setAddingSkill(true);
    setEditingSkill(null);
  };
  const startEditSkill = (s: AboutSkill) => {
    setSkillForm({ category: s.category, label: s.label, value: s.value });
    setEditingSkill(s);
    setAddingSkill(false);
  };
  const cancelSkill = () => { setAddingSkill(false); setEditingSkill(null); };
  const saveSkill = () => {
    if (!skillForm.category || !skillForm.label) return;
    let skills: AboutSkill[];
    if (editingSkill) {
      skills = aboutData.skills.map(s => s.id === editingSkill.id ? { ...editingSkill, ...skillForm } : s);
    } else {
      skills = [...aboutData.skills, { id: uid(), ...skillForm }];
    }
    updateAboutData({ ...aboutData, skills });
    cancelSkill();
  };
  const deleteSkill = (id: string) => {
    updateAboutData({ ...aboutData, skills: aboutData.skills.filter(s => s.id !== id) });
  };

  // ── Certifications CRUD ──
  const startAddCert = () => {
    setCertForm({ name: "", org: "" });
    setAddingCert(true);
    setEditingCert(null);
  };
  const startEditCert = (c: AboutCertification) => {
    setCertForm({ name: c.name, org: c.org });
    setEditingCert(c);
    setAddingCert(false);
  };
  const cancelCert = () => { setAddingCert(false); setEditingCert(null); };
  const saveCert = () => {
    if (!certForm.name || !certForm.org) return;
    let certs: AboutCertification[];
    if (editingCert) {
      certs = aboutData.certifications.map(c => c.id === editingCert.id ? { ...editingCert, ...certForm } : c);
    } else {
      certs = [...aboutData.certifications, { id: uid(), ...certForm }];
    }
    updateAboutData({ ...aboutData, certifications: certs });
    cancelCert();
  };
  const deleteCert = (id: string) => {
    updateAboutData({ ...aboutData, certifications: aboutData.certifications.filter(c => c.id !== id) });
  };

  const skillCategories = [...new Set(aboutData.skills.map(s => s.category))];

  return (
    <div className="space-y-10">
      {/* ── Bio & Tagline ── */}
      <section>
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">Bio & Tagline</h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tagline</label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Short inspiring tagline..."
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="About description..."
            />
          </div>
          <button onClick={saveBio} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> {bioSaved ? "Saved ✓" : "Save Bio"}
          </button>
        </div>
      </section>

      {/* ── Skills ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-foreground">Skills & Percentages</h3>
          <button onClick={startAddSkill} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>

        {(addingSkill || editingSkill) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <input
                  value={skillForm.category}
                  onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Cloud & DevOps"
                  list="skill-categories"
                />
                <datalist id="skill-categories">
                  {skillCategories.map((c: string) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Skill Name</label>
                <input
                  value={skillForm.label}
                  onChange={e => setSkillForm({ ...skillForm, label: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Python"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Percentage ({skillForm.value}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillForm.value}
                  onChange={e => setSkillForm({ ...skillForm, value: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveSkill} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
              <button onClick={cancelSkill} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {aboutData.skills.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{s.category}</span>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <span className="text-xs text-primary font-semibold">{s.value}%</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEditSkill(s)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteSkill(s.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Certifications ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-foreground">Certifications</h3>
          <button onClick={startAddCert} className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>

        {(addingCert || editingCert) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Certification Name</label>
                <input
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. AWS Cloud Quest"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Organization</label>
                <input
                  value={certForm.org}
                  onChange={e => setCertForm({ ...certForm, org: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveCert} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Save</button>
              <button onClick={cancelCert} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {aboutData.certifications.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground ml-2">— {c.org}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEditCert(c)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteCert(c.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
