import React, { useState } from 'react';
import { apiClient } from '../utils/api';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await apiClient.login(email, password);
      } else {
        await apiClient.register({
          email,
          password,
          full_name: fullName,
          role: 'client',
        });
      }
      localStorage.setItem('isAuthenticated', 'true');
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthPlaceholder = (provider: string) => {
    alert(`${provider} authentication will be implemented in the next iteration`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '16px',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '48px',
          maxWidth: '440px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
          }}
        >
          x8work
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          {isLogin ? 'Welcome back' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="glass-card"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-card"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass-card"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-card"
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid var(--brand-cyan)',
              borderRadius: '8px',
              background: 'rgba(0, 212, 255, 0.15)',
              color: 'var(--brand-cyan)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div
          style={{
            margin: '24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            or continue with
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handleOAuthPlaceholder('Google')}
            className="glass-card"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthPlaceholder('Facebook')}
            className="glass-card"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => handleOAuthPlaceholder('Apple')}
            className="glass-card"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Apple
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-cyan)',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
