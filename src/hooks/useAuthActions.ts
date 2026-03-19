import { useState } from 'react';
import { signUp as supabaseSignUp, signIn as supabaseSignIn, AuthResponse } from '@/lib/auth';

interface UseAuthActionsReturn {
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for auth operations
 * Provides sign-up and sign-in functionality with loading and error states
 */
export function useAuthActions(): UseAuthActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabaseSignUp(email, password);
      if (!response.success) {
        setError(response.error || response.message);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: 'Sign up failed',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabaseSignIn(email, password);
      if (!response.success) {
        setError(response.error || response.message);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: 'Sign in failed',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    isLoading,
    error,
  };
}
