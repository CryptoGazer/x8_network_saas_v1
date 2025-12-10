import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import OAuthCallback from './pages/OAuthCallback';
import MagicLinkCallback from './pages/MagicLinkCallback';
import Dashboard from './Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function RoleBasedDashboard() {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState('EN');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Route based on user role
  if (user.role === 'admin') {
    return <AdminDashboard language={language} onLanguageChange={setLanguage} onLogout={logout} />;
  }

  if (user.role === 'manager') {
    return <ManagerDashboard language={language} onLanguageChange={setLanguage} onLogout={logout} />;
  }

  // Default to client dashboard
  return <Dashboard />;
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/auth/magic-link" element={<MagicLinkCallback />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <RoleBasedDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
