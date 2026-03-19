import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { signIn as supabaseSignIn, signOut as supabaseSignOut, onAuthStateChange, AuthUser } from "@/lib/auth";

interface AuthContextType {
  isAdmin: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithPassword: (password: string) => boolean; // Legacy password auth
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_PASSWORD = "srpadmin2026";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("srp_admin") === "true");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Supabase auth state changes on mount
  useEffect(() => {
    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        setIsAdmin(true);
        sessionStorage.setItem("srp_admin", "true");
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await supabaseSignIn(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAdmin(true);
        sessionStorage.setItem("srp_admin", "true");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setUser(null);
      setIsAdmin(false);
      sessionStorage.removeItem("srp_admin");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy password-based login
  const loginWithPassword = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("srp_admin", "true");
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, isLoading, login, logout, loginWithPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
