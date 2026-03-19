import { useState } from 'react';
import { useInsertMatch } from '@/hooks/useMatches';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { InsertMatchData } from '@/lib/matches';

interface MatchFormProps {
  onSuccess?: () => void;
}

export default function MatchInsertForm({ onSuccess }: MatchFormProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { mutate: insertMatch, isPending, data: response } = useInsertMatch();

  const [formData, setFormData] = useState<InsertMatchData>({
    team1_id: '',
    team2_id: '',
    status: 'upcoming',
    match_date: '',
    venue: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [manualError, setManualError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.team1_id.trim()) {
      errors.team1_id = 'Team 1 ID is required';
    }

    if (!formData.team2_id.trim()) {
      errors.team2_id = 'Team 2 ID is required';
    }

    if (formData.team1_id === formData.team2_id) {
      errors.team2_id = 'Teams must be different';
    }

    if (!formData.match_date) {
      errors.match_date = 'Match date is required';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setManualError('You must be logged in to create a match');
      return;
    }

    insertMatch(formData, {
      onSuccess: (result) => {
        if (result.success) {
          setFormData({
            team1_id: '',
            team2_id: '',
            status: 'upcoming',
            match_date: '',
            venue: '',
          });
          onSuccess?.();
        } else {
          setManualError(result.error || result.message);
        }
      },
      onError: (error) => {
        setManualError(error instanceof Error ? error.message : 'Failed to insert match');
      },
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">Please log in to create a match</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 max-w-2xl"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Create New Match
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Add a new match to the system</p>
      </div>

      {/* Success Message */}
      {response?.success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-700">{response.message}</p>
            {response.data && (
              <p className="text-xs text-green-600 mt-1">
                Match ID: {response.data.id}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Messages */}
      {(manualError || response?.error) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{manualError || response?.error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team 1 ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Team 1 ID *
          </label>
          <input
            type="text"
            name="team1_id"
            value={formData.team1_id}
            onChange={handleChange}
            placeholder="e.g., team-001"
            disabled={isPending}
            className={`w-full px-4 py-2 rounded-lg bg-secondary text-foreground border transition-colors ${
              validationErrors.team1_id
                ? 'border-destructive'
                : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
          />
          {validationErrors.team1_id && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.team1_id}</p>
          )}
        </div>

        {/* Team 2 ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Team 2 ID *
          </label>
          <input
            type="text"
            name="team2_id"
            value={formData.team2_id}
            onChange={handleChange}
            placeholder="e.g., team-002"
            disabled={isPending}
            className={`w-full px-4 py-2 rounded-lg bg-secondary text-foreground border transition-colors ${
              validationErrors.team2_id
                ? 'border-destructive'
                : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
          />
          {validationErrors.team2_id && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.team2_id}</p>
          )}
        </div>

        {/* Match Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Match Date *
          </label>
          <input
            type="datetime-local"
            name="match_date"
            value={formData.match_date}
            onChange={handleChange}
            disabled={isPending}
            className={`w-full px-4 py-2 rounded-lg bg-secondary text-foreground border transition-colors ${
              validationErrors.match_date
                ? 'border-destructive'
                : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
          />
          {validationErrors.match_date && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.match_date}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isPending}
            className={`w-full px-4 py-2 rounded-lg bg-secondary text-foreground border transition-colors ${
              validationErrors.status
                ? 'border-destructive'
                : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
          {validationErrors.status && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.status}</p>
          )}
        </div>

        {/* Venue (Optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Venue (Optional)
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g., Cricket Ground, Mumbai"
            disabled={isPending}
            className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground border border-border transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-6 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating match...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Match
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-muted-foreground mt-4">
        * Required fields. All fields will be saved to Supabase with your user ID.
      </p>
    </motion.div>
  );
}
