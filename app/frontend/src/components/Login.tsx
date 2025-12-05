import React, { useState } from 'react';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiClient, type LoginRequest } from '../lib/api';

interface LoginProps {
  onSuccess: () => void;
  onBack: () => void;
  language: string;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onBack, language }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    EN: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Sign In',
      loggingIn: 'Signing in...',
      back: 'Back',
      noAccount: "Don't have an account?",
      register: 'Create one',
    },
    ES: {
      title: 'Bienvenido de Vuelta',
      subtitle: 'Inicia sesión en tu cuenta',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu@ejemplo.com',
      password: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña',
      loginButton: 'Iniciar Sesión',
      loggingIn: 'Iniciando sesión...',
      back: 'Volver',
      noAccount: '¿No tienes una cuenta?',
      register: 'Crear una',
    }
  };

  const t = text[language as keyof typeof text] || text.EN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.login(formData);
      apiClient.saveTokens(response);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        padding: '48px',
        maxWidth: '450px',
        width: '100%'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '24px',
            padding: '0',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--brand-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(0, 212, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--brand-cyan)'
          }}>
            <LogIn size={32} color="var(--brand-cyan)" />
          </div>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          {t.title}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '16px'
        }}>
          {t.subtitle}
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 92, 92, 0.15)',
            border: '1px solid var(--danger-red)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} color="var(--danger-red)" />
            <span style={{
              color: 'var(--danger-red)',
              fontSize: '14px'
            }}>
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {t.email}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t.emailPlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {t.password}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={t.passwordPlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-card"
            style={{
              width: '100%',
              padding: '16px',
              border: '1px solid var(--brand-cyan)',
              borderRadius: '8px',
              background: loading ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 212, 255, 0.15)',
              color: 'var(--brand-cyan)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all var(--transition-normal)',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? t.loggingIn : t.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
};
