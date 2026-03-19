import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useAuthActions } from '@/hooks/useAuthActions';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, error: authError } = useAuthActions();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Validate form
  const validateForm = () => {
    const newErrors: typeof validationErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await signIn(formData.email, formData.password);

      if (response.success) {
        // Redirect to dashboard on successful login
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        setError(response.error || response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              variants={itemVariants}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto flex items-center justify-center mb-4"
            >
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold text-foreground mb-2"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-sm"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-5" variants={containerVariants}>
            {/* Error Message */}
            {(error || authError) && (
              <motion.div
                variants={itemVariants}
                className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error || authError}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                  validationErrors.email
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <span>{validationErrors.email}</span>
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                    validationErrors.password
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-border focus:ring-primary'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="mt-6 pt-6 border-t border-border text-center"
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Demo Info */}
          <motion.div
            variants={itemVariants}
            className="mt-4 p-4 bg-secondary rounded-lg border border-border"
          >
            <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">
              Email: <span className="text-foreground font-mono">ppavankalyan3306@gmail.com</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Background Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl -z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-0 right-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl -z-10"
        />
      </motion.div>
    </div>
  );
}
