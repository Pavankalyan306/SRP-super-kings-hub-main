import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        setError("Reset session not found. Please open the latest reset link from email.");
      } else {
        setIsReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirm) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Failed to update password.");
        return;
      }
      setMessage("Password updated successfully. You can now sign in.");
      setTimeout(() => navigate("/admin/login", { replace: true }), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-8"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Set New Password</h1>
        <p className="text-sm text-muted-foreground mb-6">Create a new admin password for login.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary text-foreground border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || !isReady}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-secondary text-foreground border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || !isReady}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={isLoading || !isReady}
            className="w-full gradient-gold text-primary-foreground font-semibold py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
