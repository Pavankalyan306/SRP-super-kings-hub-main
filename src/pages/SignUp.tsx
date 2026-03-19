import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthActions } from '@/hooks/useAuthActions';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isLoading, error: authError } = useAuthActions();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await signUp(formData.email, formData.password);

      if (response.success) {
        setSuccess(true);
        setFormData({ email: '', password: '', confirmPassword: '' });

        // Redirect to login after brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.error || response.message || 'Sign up failed. Please try again.');
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

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
  const strengthColor = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][passwordStrength];

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
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold text-foreground mb-2"
            >
              Create Account
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-sm"
            >
              Join us to access exclusive features
            </motion.p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-5"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-500">
                Account created successfully! Redirecting to login...
              </p>
            </motion.div>
          )}

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
                <p className="mt-1 text-sm text-destructive">{validationErrors.email}</p>
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
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div variants={itemVariants} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength ? strengthColor : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className="font-semibold text-foreground">{strengthLabel}</span>
                  </p>
                </motion.div>
              )}

              {validationErrors.password && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.password}</p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                    validationErrors.confirmPassword
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-border focus:ring-primary'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{validationErrors.confirmPassword}</p>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign in
              </Link>
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
