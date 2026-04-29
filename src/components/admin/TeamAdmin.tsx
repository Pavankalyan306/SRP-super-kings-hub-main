import { useState } from "react";
import { useMatches } from "@/hooks/useMatches";
import {
  useAddMatchPlayer,
  useDeleteMatchPlayer,
  useMatchPlayers,
  useUpdateMatchPlayerRoleFlags,
  useUpdateMatchPlayerTeam,
} from "@/hooks/useMatchPlayers";
import { usePlayers } from "@/hooks/usePlayers";
import { toast } from "@/hooks/use-toast";
import { MatchPlayer } from "@/types/cricket";
import { motion } from "framer-motion";
import { ArrowLeftRight, Shield, Star, Trash2 } from "lucide-react";

export default function TeamAdmin() {
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, error: matchesLoadError } = useMatches();
  const { data: players = [], isLoading: playersLoading } = usePlayers();

  const match = matches.find((m) => m.id === selectedMatchId);
  const { data: assigned = [], isLoading: assignmentsLoading } = useMatchPlayers(
    selectedMatchId,
    match?.teamAId,
    match?.teamBId
  );
  const { mutate: addMatchPlayer } = useAddMatchPlayer();
  const { mutate: updateMatchPlayerTeam } = useUpdateMatchPlayerTeam();
  const { mutate: updateMatchPlayerRoleFlags } = useUpdateMatchPlayerRoleFlags();
  const { mutate: deleteMatchPlayer } = useDeleteMatchPlayer();

  const teamA = assigned.filter((mp) => mp.team === "A");
  const teamB = assigned.filter((mp) => mp.team === "B");
  const assignedIds = new Set(assigned.map((mp) => mp.playerId));
  const unassigned = players.filter((p) => !assignedIds.has(p.id));

  const assignPlayer = (playerId: string, team: "A" | "B") => {
    const teamId = team === "A" ? match?.teamAId : match?.teamBId;
    if (!selectedMatchId || !teamId) return;

    addMatchPlayer(
      { matchId: selectedMatchId, playerId, teamId },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast({ title: "Assign failed", description: response.error, variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Assign failed", description: "Could not assign player.", variant: "destructive" }),
      }
    );
  };

  const swapTeam = (mp: MatchPlayer) => {
    const nextTeamId = mp.team === "A" ? match?.teamBId : match?.teamAId;
    if (!nextTeamId) return;

    updateMatchPlayerTeam(
      { matchId: selectedMatchId, assignmentId: mp.id, teamId: nextTeamId },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast({ title: "Update failed", description: response.error, variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Update failed", description: "Could not move player.", variant: "destructive" }),
      }
    );
  };

  const toggleCaptain = (mp: MatchPlayer) => {
    updateMatchPlayerRoleFlags(
      { matchId: selectedMatchId, assignmentId: mp.id, current: mp, flag: "captain", enabled: !mp.isCaptain },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast({ title: "Update failed", description: response.error, variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Update failed", description: "Could not update captain.", variant: "destructive" }),
      }
    );
  };

  const toggleWK = (mp: MatchPlayer) => {
    updateMatchPlayerRoleFlags(
      { matchId: selectedMatchId, assignmentId: mp.id, current: mp, flag: "wicketkeeper", enabled: !mp.isWicketKeeper },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast({ title: "Update failed", description: response.error, variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Update failed", description: "Could not update wicket keeper.", variant: "destructive" }),
      }
    );
  };

  const removeAssignment = (assignmentId: string) => {
    deleteMatchPlayer(
      { matchId: selectedMatchId, assignmentId },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast({ title: "Remove failed", description: response.error, variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Remove failed", description: "Could not remove player.", variant: "destructive" }),
      }
    );
  };

  const getPlayerName = (playerId: string) => players.find((p) => p.id === playerId)?.name || "Unknown";
  const getPlayerRole = (playerId: string) => players.find((p) => p.id === playerId)?.role || "";

  return (
    <div>
      <div className="mb-6">
        <label className="text-xs text-muted-foreground mb-1 block">Select Match</label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="w-full max-w-md bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">-- Select a match --</option>
          {matchesLoading ? (
            <option value="" disabled>Loading matches...</option>
          ) : (
            matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.teamA} vs {m.teamB} ({m.date}) - {m.status}
              </option>
            ))
          )}
        </select>
      </div>

      {matchesError && (
        <p className="text-destructive text-sm mb-4">Failed to load matches: {matchesLoadError?.message}</p>
      )}

      {!selectedMatchId && (
        <p className="text-muted-foreground text-sm">Select a match to manage team assignments.</p>
      )}

      {selectedMatchId && (playersLoading || assignmentsLoading) && (
        <p className="text-muted-foreground text-sm">Loading team assignments...</p>
      )}

      {selectedMatchId && match && (
        <div className="space-y-6">
          {unassigned.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading text-sm font-bold text-foreground mb-3">
                Unassigned Players ({unassigned.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {unassigned.map((p) => (
                  <div key={p.id} className="flex items-center gap-1 bg-secondary rounded-md px-3 py-1.5 text-sm">
                    <span className="text-foreground font-medium">{p.name}</span>
                    <span className="text-muted-foreground text-xs">({p.role})</span>
                    <button
                      onClick={() => assignPlayer(p.id, "A")}
                      className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded hover:bg-primary/30 transition-colors"
                    >
                      To A
                    </button>
                    <button
                      onClick={() => assignPlayer(p.id, "B")}
                      className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded hover:bg-accent/30 transition-colors"
                    >
                      To B
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <TeamPanel
              label={`Team A - ${match.teamA}`}
              members={teamA}
              getPlayerName={getPlayerName}
              getPlayerRole={getPlayerRole}
              onSwap={swapTeam}
              onToggleCaptain={toggleCaptain}
              onToggleWK={toggleWK}
              onRemove={removeAssignment}
              accent="primary"
            />
            <TeamPanel
              label={`Team B - ${match.teamB}`}
              members={teamB}
              getPlayerName={getPlayerName}
              getPlayerRole={getPlayerRole}
              onSwap={swapTeam}
              onToggleCaptain={toggleCaptain}
              onToggleWK={toggleWK}
              onRemove={removeAssignment}
              accent="accent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPanel({
  label,
  members,
  getPlayerName,
  getPlayerRole,
  onSwap,
  onToggleCaptain,
  onToggleWK,
  onRemove,
  accent,
}: {
  label: string;
  members: MatchPlayer[];
  getPlayerName: (id: string) => string;
  getPlayerRole: (id: string) => string;
  onSwap: (mp: MatchPlayer) => void;
  onToggleCaptain: (mp: MatchPlayer) => void;
  onToggleWK: (mp: MatchPlayer) => void;
  onRemove: (id: string) => void;
  accent: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg overflow-hidden">
      <div className={`px-4 py-3 border-b border-border bg-${accent}/10`}>
        <h3 className="font-heading text-sm font-bold text-foreground">{label} ({members.length})</h3>
      </div>
      {members.length === 0 ? (
        <p className="text-muted-foreground text-xs p-4">No players assigned.</p>
      ) : (
        <div className="divide-y divide-border/50">
          {members.map((mp) => (
            <div key={mp.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm text-foreground truncate">{getPlayerName(mp.playerId)}</span>
                <span className="text-xs text-muted-foreground shrink-0">({getPlayerRole(mp.playerId)})</span>
                {mp.isCaptain && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold shrink-0">C</span>}
                {mp.isWicketKeeper && <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold shrink-0">WK</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onToggleCaptain(mp)} title="Toggle Captain" className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onToggleWK(mp)} title="Toggle WK" className="p-1.5 text-muted-foreground hover:text-accent transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onSwap(mp)} title="Swap team" className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onRemove(mp.id)} title="Remove" className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
