import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient, type RegisterRequest } from '../lib/api';

interface RegisterProps {
  onSuccess: () => void;
  onBack: () => void;
  language: string;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onBack, language }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    full_name: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    EN: {
      title: 'Create Account',
      subtitle: 'Start your journey with X8 Network',
      fullName: 'Full Name',
      fullNamePlaceholder: 'John Doe',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: 'Create a strong password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      registerButton: 'Create Account',
      registering: 'Creating account...',
      back: 'Back',
      hasAccount: 'Already have an account?',
      login: 'Sign in',
      passwordMismatch: 'Passwords do not match',
      passwordRequirements: 'Password must be at least 8 characters',
    },
    ES: {
      title: 'Crear Cuenta',
      subtitle: 'Comienza tu viaje con X8 Network',
      fullName: 'Nombre Completo',
      fullNamePlaceholder: 'Juan Pérez',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu@ejemplo.com',
      password: 'Contraseña',
      passwordPlaceholder: 'Crea una contraseña segura',
      confirmPassword: 'Confirmar Contraseña',
      confirmPasswordPlaceholder: 'Re-ingresa tu contraseña',
      registerButton: 'Crear Cuenta',
      registering: 'Creando cuenta...',
      back: 'Volver',
      hasAccount: '¿Ya tienes una cuenta?',
      login: 'Iniciar sesión',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordRequirements: 'La contraseña debe tener al menos 8 caracteres',
    }
  };

  const t = text[language as keyof typeof text] || text.EN;

  const validateForm = (): boolean => {
    if (formData.password.length < 8) {
      setError(t.passwordRequirements);
      return false;
    }
    if (formData.password !== confirmPassword) {
      setError(t.passwordMismatch);
      return false;
    }
    return true;
  };

  // For public registration, always use CLIENT role
  // For admin panel, show role selector
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.register({
        ...formData,
        role: 'client'  // Always client for public registration
      });
      apiClient.saveTokens(response);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const passwordsMatch = confirmPassword && formData.password === confirmPassword;
  const passwordLengthValid = formData.password.length >= 8;

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
            e.currentTarget.style.color = 'var(--brand-teal)';
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
            background: 'rgba(0, 179, 136, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--brand-teal)'
          }}>
            <UserPlus size={32} color="var(--brand-teal)" />
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {t.fullName}
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder={t.fullNamePlaceholder}
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
                  e.currentTarget.style.borderColor = 'var(--brand-teal)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
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
                  e.currentTarget.style.borderColor = 'var(--brand-teal)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
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
                  padding: '12px 42px 12px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-teal)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
              {formData.password && passwordLengthValid && (
                <CheckCircle
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--success-green)',
                    pointerEvents: 'none'
                  }}
                />
              )}
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
              {t.confirmPassword}
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder={t.confirmPasswordPlaceholder}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-teal)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              />
              {passwordsMatch && (
                <CheckCircle
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--success-green)',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-card"
            style={{
              width: '100%',
              padding: '16px',
              border: '1px solid var(--brand-teal)',
              borderRadius: '8px',
              background: loading ? 'rgba(0, 179, 136, 0.08)' : 'rgba(0, 179, 136, 0.15)',
              color: 'var(--brand-teal)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all var(--transition-normal)',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(0, 179, 136, 0.25)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 179, 136, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(0, 179, 136, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? t.registering : t.registerButton}
          </button>
        </form>
      </div>
    </div>
  );
};
