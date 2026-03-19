import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute, useCanAccess } from '@/hooks/useProtectedRoute';
import { Navigate } from 'react-router-dom';
import { LogOut, Lock, User } from 'lucide-react';

/**
 * Example: Using ProtectedRoute component (in App.tsx)
 */
export function ExampleProtectedRouteComponent() {
  return (
    <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mb-6">
      <h3 className="font-bold mb-2">Method 1: ProtectedRoute Component</h3>
      <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { ProtectedRoute } from '@/components/ProtectedRoute';

// In App.tsx routes
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <Admin />
    </ProtectedRoute>
  }
/>

// Or for user-level protection
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  }
/>`}
      </pre>
    </div>
  );
}

/**
 * Example: Using useProtectedRoute hook
 */
export function ExampleProtectedHook() {
  return (
    <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6">
      <h3 className="font-bold mb-2">Method 2: useProtectedRoute Hook</h3>
      <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">{`import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export function AdminPage() {
  const { isLoading, isAuthorized, user } = useProtectedRoute({
    requiredRole: 'admin'
  });

  if (isLoading) return <Loader />;
  if (!isAuthorized) return <Navigate to="/login" />;

  return <AdminDashboard user={user} />;
}`}</pre>
    </div>
  );
}

/**
 * Example: Using useCanAccess hook
 */
export function ExampleCanAccessHook() {
  return (
    <div className="bg-purple-100 border border-purple-400 rounded-lg p-4 mb-6">
      <h3 className="font-bold mb-2">Method 3: useCanAccess Hook (No Navigation)</h3>
      <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">{`import { useCanAccess } from '@/hooks/useProtectedRoute';

export function Navbar() {
  const canAccessAdmin = useCanAccess('admin');
  const isAdmin = useCanAccess('admin');

  return (
    <nav>
      <a href="/">Home</a>
      {canAccessAdmin && <a href="/admin">Admin</a>}
    </nav>
  );
}`}</pre>
    </div>
  );
}

/**
 * Example: Conditional rendering based on auth
 */
export function ExampleConditionalAccess() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="text-center p-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-lg">Please log in to access this page</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
        <p className="text-lg">Admin privileges required</p>
      </div>
    );
  }

  return (
    <div>
      <User className="w-12 h-12 mx-auto mb-4 text-green-500" />
      <p className="text-center">Welcome, Admin! {user.email}</p>
    </div>
  );
}

/**
 * Example: Full Admin Dashboard with logout
 */
export function ExampleAdminDashboard() {
  const { user, isAdmin, logout } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Logged in as: {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Matches</p>
              <p className="text-3xl font-bold">42</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              🏏
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Active Players</p>
              <p className="text-3xl font-bold">156</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Live Matches</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              🔴
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full example page showing all protection methods
 */
export default function ProtectionExamples() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Protected Routes - All Methods</h1>

      <ExampleProtectedRouteComponent />
      <ExampleProtectedHook />
      <ExampleCanAccessHook />

      <div className="mt-8 bg-amber-100 border border-amber-400 rounded-lg p-4">
        <h3 className="font-bold mb-2">✅ Key Features</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Automatic redirect to /login if not authenticated</li>
          <li>Role-based access control (admin/user)</li>
          <li>Loading state handling</li>
          <li>Preserves location state for post-login redirect</li>
          <li>Multiple protection patterns to choose from</li>
          <li>TypeScript support</li>
          <li>Seamless Supabase integration</li>
        </ul>
      </div>
    </div>
  );
}
