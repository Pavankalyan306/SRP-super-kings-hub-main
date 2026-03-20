import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Newspaper } from "lucide-react";
import { useData } from "@/context/DataContext";
import MatchCard from "@/components/MatchCard";
import NewsCard from "@/components/NewsCard";
import LiveScoresWidget from "@/components/LiveScoresWidget";
import { useMatches } from "@/hooks/useMatches";
import heroBg from "@/assets/hero-cricket.jpg";

export default function Index() {
  const { data: matches = [], isLoading, isError, error } = useMatches();
  const { news } = useData();

  if (isLoading) {
    return <div className="container py-10">Loading matches...</div>;
  }

  if (isError) {
    return <div className="container py-10">Failed to load matches: {error?.message}</div>;
  }

  const liveOrRecent = matches.filter((m) => m.status === "live" || m.status === "completed").slice(0, 2);
  const upcoming = matches.filter((m) => m.status === "upcoming").slice(0, 2);
  const latestNews = news.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Cricket stadium" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-gradient-gold mb-4">
            SRP SUPER KINGS
          </h1>
          <p className="font-heading text-xl md:text-2xl text-foreground/80 mb-2 tracking-wider">CRICKETS</p>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Dominating the pitch with passion, power, and precision.
          </p>
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Matches <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Live Scores Widget */}
      <LiveScoresWidget />

      {/* Quick stats */}
      <section className="border-b border-border">
        <div className="container grid grid-cols-3 divide-x divide-border">
          {[
            { icon: Trophy, label: "Matches", value: matches.length },
            { icon: Users, label: "Players", value: "Squad" },
            { icon: Newspaper, label: "News", value: news.length },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="py-6 text-center"
            >
              <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live / Recent Matches */}
      {liveOrRecent.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Live & Recent</h2>
            <Link to="/matches" className="text-primary text-sm hover:underline flex items-center gap-1">
              All Matches <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {liveOrRecent.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="container pb-12">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Upcoming Matches</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="container pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Latest News</h2>
            <Link to="/news" className="text-primary text-sm hover:underline flex items-center gap-1">
              All News <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {latestNews.map((n, i) => (
              <NewsCard key={n.id} item={n} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
