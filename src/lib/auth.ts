import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: 'Sign up failed',
        error: error.message,
      };
    }

    if (data.user) {
      return {
        success: true,
        message: 'Sign up successful. Please check your email to confirm.',
        user: {
          id: data.user.id,
          email: data.user.email || '',
        },
      };
    }

    return {
      success: false,
      message: 'Sign up failed',
      error: 'Unknown error occurred',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign up failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: 'Sign in failed',
        error: error.message,
      };
    }

    if (data.user) {
      return {
        success: true,
        message: 'Sign in successful',
        user: {
          id: data.user.id,
          email: data.user.email || '',
        },
      };
    }

    return {
      success: false,
      message: 'Sign in failed',
      error: 'Unknown error occurred',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign in failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: 'Sign out failed',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sign out failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
        });
      } else {
        callback(null);
      }
    }
  );

  return subscription;
}
