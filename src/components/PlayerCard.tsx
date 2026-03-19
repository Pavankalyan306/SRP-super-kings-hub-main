import { Player } from "@/types/cricket";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const roleBadge: Record<Player["role"], string> = {
  Batsman: "bg-primary/20 text-primary",
  Bowler: "bg-accent/20 text-accent",
  "All-rounder": "bg-cricket-orange/20 text-cricket-orange",
  "Wicket Keeper": "bg-cricket-green-light/20 text-cricket-green-light",
};

export default function PlayerCard({ player, index = 0 }: { player: Player; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-lg overflow-hidden card-hover group"
    >
      {/* Image area */}
      <div className="h-48 bg-secondary flex items-center justify-center relative overflow-hidden">
        {player.image ? (
          <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-20 h-20 text-muted-foreground/30" />
        )}
        {player.jerseyNumber && (
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full gradient-gold flex items-center justify-center font-heading font-bold text-primary-foreground text-sm">
            {player.jerseyNumber}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg font-bold text-foreground">{player.name}</h3>
        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[player.role]}`}>
          {player.role}
        </span>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Matches" value={player.matches} />
          <Stat label="Runs" value={player.runs} />
          <Stat label="Wickets" value={player.wickets} />
          <Stat label="SR" value={player.strikeRate} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading font-bold text-foreground">{value}</p>
    </div>
  );
}
