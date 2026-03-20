import MatchCard from "@/components/MatchCard";
import { motion } from "framer-motion";
import { useMatches } from "@/hooks/useMatches";

export default function Matches() {
  const { data: matches = [], isLoading, isError, error } = useMatches();

  if (isLoading) {
    return <div className="container py-10">Loading matches...</div>;
  }

  if (isError) {
    return <div className="container py-10">Failed to load matches: {error?.message}</div>;
  }

  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "upcoming");
  const completed = matches.filter((m) => m.status === "completed");

  return (
    <div className="container py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading text-4xl font-bold text-gradient-gold mb-8"
      >
        Matches
      </motion.h1>

      {live.length > 0 && (
        <Section title="🔴 Live" matches={live} />
      )}
      {upcoming.length > 0 && (
        <Section title="Upcoming" matches={upcoming} />
      )}
      {completed.length > 0 && (
        <Section title="Completed" matches={completed} />
      )}
      {matches.length === 0 && (
        <p className="text-muted-foreground text-center py-20">No matches yet.</p>
      )}
    </div>
  );
}

function Section({ title, matches }: { title: string; matches: any[] }) {
  return (
    <div className="mb-10">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m, i) => (
          <MatchCard key={m.id} match={m} index={i} />
        ))}
      </div>
    </div>
  );
}
