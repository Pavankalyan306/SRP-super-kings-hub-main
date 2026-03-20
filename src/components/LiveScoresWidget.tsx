import { motion, AnimatePresence } from "framer-motion";
import { Activity, RefreshCw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMatches } from "@/hooks/useMatches";

export default function LiveScoresWidget() {
  const { data: matches = [], isLoading } = useMatches();
  const [tick, setTick] = useState(0);
  const hasLive = useRef(false);

  // Auto-refresh every 3 seconds while live matches exist
  useEffect(() => {
    hasLive.current = matches.some((m) => m.status === "live");
    if (!hasLive.current) return;
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, [matches]);

  const liveMatches = matches.filter((m) => m.status === "live");

  if (liveMatches.length === 0) return null;

  return (
    <section className="bg-destructive/5 border-y border-destructive/20">
      <div className="container py-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-destructive animate-pulse" />
          <span className="font-heading text-sm font-bold uppercase tracking-wider text-destructive">
            Live Now
          </span>
          <RefreshCw
            className="w-3 h-3 text-muted-foreground ml-auto animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <span className="text-[10px] text-muted-foreground">Auto-updating</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {liveMatches.map((match) => (
              <motion.div
                key={match.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {match.teamA}
                    </span>
                    <motion.span
                      key={match.scoreA}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-heading text-lg font-bold text-primary"
                    >
                      {match.scoreA || "—"}
                    </motion.span>
                  </div>
                  {match.oversA && (
                    <p className="text-[11px] text-muted-foreground">({match.oversA} ov)</p>
                  )}

                  <div className="border-t border-border my-1" />

                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {match.teamB}
                    </span>
                    <motion.span
                      key={match.scoreB}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-heading text-lg font-bold text-primary"
                    >
                      {match.scoreB || "Yet to bat"}
                    </motion.span>
                  </div>
                  {match.oversB && (
                    <p className="text-[11px] text-muted-foreground">({match.oversB} ov)</p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  <span className="text-[10px] text-muted-foreground">{match.venue}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
