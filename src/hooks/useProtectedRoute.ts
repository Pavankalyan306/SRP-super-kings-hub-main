import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UseProtectedRouteOptions {
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

/**
 * Hook to protect routes and handle redirects
 * Can be used inside components to protect conditional rendering
 */
export function useProtectedRoute(options?: UseProtectedRouteOptions) {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requiredRole = 'user', redirectTo = '/login' } = options || {};

  useEffect(() => {
    if (isLoading) return; // Wait for auth check

    // Check if user is authenticated
    if (!user) {
      navigate(redirectTo, { state: { from: location }, replace: true });
      return;
    }

    // Check role-based access
    if (requiredRole === 'admin' && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, isAdmin, requiredRole, navigate, location, redirectTo]);

  return {
    isAuthenticated: !!user,
    isAdmin,
    user,
    isLoading,
    isAuthorized:
      !!user && (requiredRole === 'user' || (requiredRole === 'admin' && isAdmin)),
  };
}

/**
 * Hook to check if user can access a route
 * Returns authorization status without navigating
 */
export function useCanAccess(requiredRole?: 'admin' | 'user') {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return false;

  if (requiredRole === 'admin') {
    return isAdmin;
  }

  return !!user;
}

export default useProtectedRoute;
