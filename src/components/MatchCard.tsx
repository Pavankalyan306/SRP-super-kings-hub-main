import { Match } from "@/types/cricket";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const statusColors: Record<Match["status"], string> = {
  upcoming: "bg-primary/20 text-primary",
  live: "bg-cricket-red/20 text-cricket-red animate-pulse-gold",
  completed: "bg-accent/20 text-accent",
};

export default function MatchCard({ match, index = 0 }: { match: Match; index?: number }) {
  return (
    <Link to={`/match/${match.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-lg p-5 card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${statusColors[match.status]}`}>
          {match.status === "live" ? "● Live" : match.status}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-foreground">{match.teamA}</span>
          {match.scoreA && <span className="font-heading text-lg font-bold text-primary">{match.scoreA}</span>}
        </div>
        {match.oversA && <p className="text-xs text-muted-foreground -mt-2">({match.oversA} ov)</p>}

        <div className="text-xs text-muted-foreground text-center font-semibold">VS</div>

        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-foreground">{match.teamB}</span>
          {match.scoreB && <span className="font-heading text-lg font-bold text-primary">{match.scoreB}</span>}
        </div>
        {match.oversB && <p className="text-xs text-muted-foreground -mt-2">({match.oversB} ov)</p>}
      </div>

      {match.result && (
        <p className="mt-4 text-sm text-accent font-medium">{match.result}</p>
      )}

      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        {match.venue}
      </div>
    </motion.div>
    </Link>
  );
}
