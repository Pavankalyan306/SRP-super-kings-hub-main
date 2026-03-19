import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  Github, Linkedin, Mail, ExternalLink, Brain, Code, Database, Terminal,
  Globe, GitBranch, Wrench, GraduationCap, Briefcase, Shield, Server,
  Cloud, Lock, Network, HardDrive, Monitor, Cpu, ChevronDown, Download,
  Award, FileCode, Activity, Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/context/DataContext";

/* ── Animation helpers ── */
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ── Typing effect hook ── */
function useTypingEffect(strings: string[], typingSpeed = 80, deletingSpeed = 40, pause = 1800) {
  const [text, setText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = strings[stringIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setStringIndex((i) => (i + 1) % strings.length);
    } else {
      timeout = setTimeout(() => {
        setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, stringIndex, strings, typingSpeed, deletingSpeed, pause]);

  return text;
}

/* ── Animated progress bar ── */
function AnimatedProgress({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setProgress(value), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2 bg-secondary" />
    </div>
  );
}

/* ── Data ── */
const TYPING_STRINGS = [
  "AI & ML Engineer",
  "IT System Administrator",
  "Cybersecurity (SOC) Enthusiast",
];

const CURRENT_ROLE_CARDS = [
  { icon: Server, title: "Windows Server 2022 & Linux", desc: "Enterprise server administration across mixed OS environments." },
  { icon: Shield, title: "Active Directory & GPO", desc: "Identity management, group policies, and access control." },
  { icon: Cloud, title: "AWS, Azure & GCP Cloud", desc: "Multi-cloud infrastructure provisioning and management." },
  { icon: Activity, title: "Splunk & Wazuh SIEM", desc: "Security event monitoring, log analysis, and threat detection." },
  { icon: Lock, title: "FortiGate Firewall & VPN", desc: "Network security, firewall rules, and secure remote access." },
  { icon: Monitor, title: "Proxmox Virtualization", desc: "VM deployment, resource allocation, and hypervisor management." },
  { icon: FileCode, title: "Python Automation", desc: "Scripting repetitive tasks for infrastructure efficiency." },
  { icon: Network, title: "DNS, DHCP, VPN & Routing", desc: "Core network services configuration and troubleshooting." },
  { icon: HardDrive, title: "Backup & Disaster Recovery", desc: "Data protection strategies and business continuity planning." },
  { icon: Cpu, title: "VFX Workflow Infrastructure", desc: "High-performance compute environments for visual effects pipelines." },
];

const CYBER_ITEMS = [
  { icon: Shield, text: "SOC operations & incident response exposure" },
  { icon: Terminal, text: "Daily learning on TryHackMe platform" },
  { icon: Activity, text: "Log analysis & threat detection with SIEM tools" },
  { icon: Lock, text: "Security hardening & vulnerability assessment" },
];

const CERT_ICON_MAP: Record<string, any> = {
  "Amazon Web Services": Cloud,
  "IBM": Code,
  "Cisco": Network,
  "Microsoft": Server,
};

const getCertIcon = (org: string) => CERT_ICON_MAP[org] || Award;

const TIMELINE = [
  {
    icon: GraduationCap,
    title: "B.Tech — AI & Machine Learning",
    subtitle: "Bachelor of Technology",
    desc: "Comprehensive study of intelligent systems, neural networks, and data-driven solutions.",
  },
  {
    icon: Briefcase,
    title: "IBM — AI & ML Internship",
    subtitle: "Industry Experience",
    desc: "Hands-on experience applying machine learning techniques to real-world enterprise challenges within IBM's AI ecosystem.",
  },
  {
    icon: Shield,
    title: "IIT Tirupati — Ethical Hacking Workshop",
    subtitle: "Cybersecurity Training",
    desc: "Intensive workshop covering penetration testing, vulnerability assessment, and cybersecurity best practices.",
  },
];

/* ── Component ── */
export default function About() {
  const { aboutData } = useData();
  const typedText = useTypingEffect(TYPING_STRINGS);

  // Group skills by category dynamically
  const skillCategories = useMemo(() => {
    const map = new Map<string, { label: string; value: number }[]>();
    aboutData.skills.forEach(s => {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push({ label: s.label, value: s.value });
    });
    return Array.from(map.entries()).map(([category, skills]) => ({ category, skills }));
  }, [aboutData.skills]);

  return (
    <div className="min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0 gradient-navy opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--cricket-gold)/0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--accent)/0.04),transparent_50%)]" />

        <div className="container relative z-10 text-center">
          <motion.div {...fade()} className="mb-8">
            <div className="w-28 h-28 rounded-full gradient-gold mx-auto flex items-center justify-center text-primary-foreground font-heading text-4xl font-bold shadow-lg glow-gold">
              PK
            </div>
          </motion.div>

          <motion.h1 {...fade(0.15)} className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-gradient-gold mb-4 leading-tight">
            P. Pavan Kalyan Kumar
          </motion.h1>

          <motion.div {...fade(0.3)} className="h-8 mb-2">
            <span className="font-heading text-lg md:text-2xl text-foreground/80 tracking-wide">
              {typedText}
              <span className="animate-pulse text-primary">|</span>
            </span>
          </motion.div>

          <motion.p {...fade(0.4)} className="text-muted-foreground max-w-xl mx-auto mb-10 text-sm md:text-base">
            {aboutData.tagline}
          </motion.p>

          <motion.div {...fade(0.5)} className="flex items-center justify-center gap-3 flex-wrap">
            <Button asChild className="gradient-gold text-primary-foreground font-semibold hover:opacity-90 shadow-md">
              <a href="https://github.com/Pavankalyan306" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" /> View GitHub
              </a>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              <a href="https://www.linkedin.com/in/p-pavan-kalyan-kumar-8b0a02232" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" /> Connect on LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline" className="border-accent/40 text-accent hover:bg-accent/10">
              <a href="mailto:pavankalyan@example.com">
                <Mail className="w-4 h-4 mr-2" /> Hire Me
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ═══════ CURRENT ROLE ═══════ */}
      <section className="container py-20">
        <motion.div {...fade()} className="text-center mb-12">
          <Badge className="gradient-gold text-primary-foreground mb-4">Present Role</Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            IT System Administrator
          </h2>
          <p className="text-primary font-heading text-lg font-semibold">VFX Global Pvt Ltd</p>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Responsible for managing, securing, and maintaining enterprise IT infrastructure —
            ensuring high availability, security compliance, and optimized performance across all systems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {CURRENT_ROLE_CARDS.map((card, i) => (
            <motion.div key={card.title} {...stagger} transition={{ duration: 0.4, delay: i * 0.06 }}>
              <Card className="h-full border-border/40 bg-card/50 backdrop-blur-md card-hover group">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ CYBERSECURITY ═══════ */}
      <section className="border-y border-border bg-secondary/20 py-20">
        <div className="container">
          <motion.div {...fade()} className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Cybersecurity Interest
            </h2>
            <div className="h-1 w-16 gradient-gold rounded mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {CYBER_ITEMS.map((item, i) => (
              <motion.div key={i} {...stagger} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-md card-hover">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SKILLS ═══════ */}
      <section className="container py-20">
        <motion.div {...fade()} className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Skills & Expertise</h2>
          <div className="h-1 w-16 gradient-gold rounded mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {skillCategories.map((cat, ci) => (
            <motion.div key={cat.category} {...stagger} transition={{ duration: 0.4, delay: ci * 0.08 }}>
              <Card className="border-border/40 bg-card/50 backdrop-blur-md h-full">
                <CardContent className="p-6">
                  <h3 className="font-heading text-base font-bold text-foreground mb-5">{cat.category}</h3>
                  <div className="space-y-4">
                    {cat.skills.map((s, si) => (
                      <AnimatedProgress key={s.label} label={s.label} value={s.value} delay={ci * 0.1 + si * 0.15} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ EDUCATION TIMELINE ═══════ */}
      <section className="border-y border-border bg-secondary/20 py-20">
        <div className="container">
          <motion.div {...fade()} className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Education & Experience
            </h2>
            <div className="h-1 w-16 gradient-gold rounded mx-auto" />
          </motion.div>

          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Node */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full gradient-gold flex items-center justify-center z-10 shadow-lg glow-gold">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>

                {/* Card */}
                <div className={`ml-20 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                  <Card className="border-border/40 bg-card/50 backdrop-blur-md">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">{item.subtitle}</Badge>
                      <h3 className="font-heading text-base font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CERTIFICATIONS ═══════ */}
      <section className="container py-20">
        <motion.div {...fade()} className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Certifications</h2>
          <div className="h-1 w-16 gradient-gold rounded mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {aboutData.certifications.map((cert, i) => {
            const CertIcon = getCertIcon(cert.org);
            return (
              <motion.div key={cert.id} {...stagger} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-md card-hover group text-center h-full">
                  <CardContent className="p-5 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <CertIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">{cert.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{cert.org}</p>
                    </div>
                    <Award className="w-4 h-4 text-primary/40" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ SOCIAL / CONNECT ═══════ */}
      <section className="border-t border-border bg-secondary/20 py-20">
        <div className="container text-center">
          <motion.div {...fade()}>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Let's Connect</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
              Open to opportunities, collaborations, and conversations about tech.
            </p>
            <div className="flex items-center justify-center gap-4">
              {[
                { href: "https://github.com/Pavankalyan306", icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/p-pavan-kalyan-kumar-8b0a02232", icon: Linkedin, label: "LinkedIn" },
                { href: "mailto:pavankalyan@example.com", icon: Mail, label: "Email" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:glow-gold transition-all duration-300"
                  aria-label={link.label}
                >
                  <link.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
