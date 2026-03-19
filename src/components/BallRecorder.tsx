import { useState } from 'react';
import { useInsertBall, useBallsByMatch } from '@/hooks/useBalls';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { BallData } from '@/lib/balls';

interface BallRecorderProps {
  matchId: string;
  onSuccess?: () => void;
}

export default function BallRecorder({ matchId, onSuccess }: BallRecorderProps) {
  const { user } = useAuth();
  const { mutate: insertBall, isPending, data: response } = useInsertBall();
  const { data: balls, isLoading: ballsLoading } = useBallsByMatch(matchId);

  const [formData, setFormData] = useState<BallData>({
    match_id: matchId,
    over_number: 0,
    ball_number: 1,
    runs: 0,
    batsman_id: '',
    bowler_id: '',
    wicket: false,
    dismissal_type: '',
    dismissal_player: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [manualError, setManualError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.over_number && formData.over_number !== 0) {
      errors.over_number = 'Over number is required';
    } else if (formData.over_number < 0) {
      errors.over_number = 'Over number must be 0 or greater';
    }

    if (!formData.ball_number || formData.ball_number < 1 || formData.ball_number > 6) {
      errors.ball_number = 'Ball number must be between 1 and 6';
    }

    if (formData.runs < 0 || formData.runs > 6) {
      errors.runs = 'Runs must be between 0 and 6';
    }

    if (!formData.batsman_id.trim()) {
      errors.batsman_id = 'Batsman ID is required';
    }

    if (!formData.bowler_id.trim()) {
      errors.bowler_id = 'Bowler ID is required';
    }

    if (formData.wicket && !formData.dismissal_type) {
      errors.dismissal_type = 'Dismissal type required for wicket';
    }

    if (formData.wicket && !formData.dismissal_player) {
      errors.dismissal_player = 'Dismissed player required for wicket';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'over_number' || name === 'ball_number' || name === 'runs'
        ? parseInt(value) || 0
        : finalValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setManualError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setManualError(null);

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setManualError('You must be logged in to record ball data');
      return;
    }

    insertBall(formData, {
      onSuccess: (result) => {
        if (result.success) {
          // Reset form
          setFormData({
            match_id: matchId,
            over_number: formData.over_number,
            ball_number: formData.ball_number < 6 ? formData.ball_number + 1 : 1,
            runs: 0,
            batsman_id: formData.batsman_id,
            bowler_id: formData.bowler_id,
            wicket: false,
            dismissal_type: '',
            dismissal_player: '',
            notes: '',
          });
          onSuccess?.();
        } else {
          setManualError(result.error || result.message);
        }
      },
      onError: (error) => {
        setManualError(error instanceof Error ? error.message : 'Failed to record ball');
      },
    });
  };

  // Calculate current over and remaining balls
  const currentOverTotal = formData.over_number * 6 + formData.ball_number;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 bg-card border border-border rounded-lg p-6"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Record Ball
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Over {formData.over_number}.{formData.ball_number}
          </p>
        </div>

        {/* Success Message */}
        {response?.success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">{response.message}</p>
          </motion.div>
        )}

        {/* Error Messages */}
        {(manualError || response?.error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{manualError || response?.error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Over Number */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Over *
            </label>
            <input
              type="number"
              name="over_number"
              value={formData.over_number}
              onChange={handleChange}
              disabled={isPending}
              min="0"
              className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                validationErrors.over_number ? 'border-destructive' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
            />
            {validationErrors.over_number && (
              <p className="mt-0.5 text-xs text-destructive">{validationErrors.over_number}</p>
            )}
          </div>

          {/* Ball Number */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Ball (1-6) *
            </label>
            <input
              type="number"
              name="ball_number"
              value={formData.ball_number}
              onChange={handleChange}
              disabled={isPending}
              min="1"
              max="6"
              className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                validationErrors.ball_number ? 'border-destructive' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
            />
            {validationErrors.ball_number && (
              <p className="mt-0.5 text-xs text-destructive">{validationErrors.ball_number}</p>
            )}
          </div>

          {/* Runs */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Runs (0-6) *
            </label>
            <input
              type="number"
              name="runs"
              value={formData.runs}
              onChange={handleChange}
              disabled={isPending}
              min="0"
              max="6"
              className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                validationErrors.runs ? 'border-destructive' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
            />
            {validationErrors.runs && (
              <p className="mt-0.5 text-xs text-destructive">{validationErrors.runs}</p>
            )}
          </div>

          {/* Batsman ID */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Batsman ID *
            </label>
            <input
              type="text"
              name="batsman_id"
              value={formData.batsman_id}
              onChange={handleChange}
              disabled={isPending}
              placeholder="e.g., bat-001"
              className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                validationErrors.batsman_id ? 'border-destructive' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
            />
            {validationErrors.batsman_id && (
              <p className="mt-0.5 text-xs text-destructive">{validationErrors.batsman_id}</p>
            )}
          </div>

          {/* Bowler ID */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Bowler ID *
            </label>
            <input
              type="text"
              name="bowler_id"
              value={formData.bowler_id}
              onChange={handleChange}
              disabled={isPending}
              placeholder="e.g., bowl-001"
              className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                validationErrors.bowler_id ? 'border-destructive' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
            />
            {validationErrors.bowler_id && (
              <p className="mt-0.5 text-xs text-destructive">{validationErrors.bowler_id}</p>
            )}
          </div>

          {/* Wicket Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="wicket"
              id="wicket"
              checked={formData.wicket}
              onChange={handleChange}
              disabled={isPending}
              className="rounded"
            />
            <label htmlFor="wicket" className="text-xs font-medium text-foreground cursor-pointer">
              Is Wicket?
            </label>
          </div>

          {/* Dismissal Type (conditional) */}
          {formData.wicket && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Dismissal Type *
              </label>
              <select
                name="dismissal_type"
                value={formData.dismissal_type}
                onChange={handleChange}
                disabled={isPending}
                className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                  validationErrors.dismissal_type ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
              >
                <option value="">Select dismissal type</option>
                <option value="bowled">Bowled</option>
                <option value="lbw">LBW</option>
                <option value="caught">Caught</option>
                <option value="stumped">Stumped</option>
                <option value="run_out">Run Out</option>
              </select>
              {validationErrors.dismissal_type && (
                <p className="mt-0.5 text-xs text-destructive">{validationErrors.dismissal_type}</p>
              )}
            </div>
          )}

          {/* Dismissed Player (conditional) */}
          {formData.wicket && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Dismissed Player *
              </label>
              <input
                type="text"
                name="dismissal_player"
                value={formData.dismissal_player}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Player who got out"
                className={`w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border ${
                  validationErrors.dismissal_player ? 'border-destructive' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
              />
              {validationErrors.dismissal_player && (
                <p className="mt-0.5 text-xs text-destructive">{validationErrors.dismissal_player}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isPending}
              placeholder="e.g., wide, no-ball"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Record Ball
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Balls List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Ball History</h2>

        {ballsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : balls && balls.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {balls.map((ball, idx) => (
              <motion.div
                key={ball.id || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-secondary rounded-lg border border-border/50 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Over {ball.over_number}.{ball.ball_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ball.batsman_id} vs {ball.bowler_id}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Runs: {ball.runs}
                    {ball.wicket && <span className="text-destructive ml-2">🏏 WICKET</span>}
                  </p>
                  {ball.wicket && (
                    <p className="text-xs text-destructive mt-1">
                      {ball.dismissal_type}: {ball.dismissal_player}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No balls recorded yet</p>
        )}
      </motion.div>
    </div>
  );
}
