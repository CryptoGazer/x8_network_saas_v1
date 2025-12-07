import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { apiClient } from '../lib/api';
import { EmailVerification } from './EmailVerification';

interface RegisterWith2FAProps {
  onSuccess: () => void;
  onBack: () => void;
  language: string;
}

type RegistrationStep = 'form' | 'verification' | 'completing';

export const RegisterWith2FA: React.FC<RegisterWith2FAProps> = ({ onSuccess, onBack, language }) => {
  const [step, setStep] = useState<RegistrationStep>('form');
  const [formData, setFormData] = useState({
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
      sendCode: 'Send Verification Code',
      sending: 'Sending code...',
      back: 'Back',
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
      sendCode: 'Enviar Código de Verificación',
      sending: 'Enviando código...',
      back: 'Volver',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordRequirements: 'La contraseña debe tener al menos 8 caracteres',
    }
  };

  const t = text[language as keyof typeof text] || text.EN;

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.sendVerificationCode({ email: formData.email });
      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = async (code: string) => {
    setStep('completing');
    setLoading(true);

    try {
      const response = await apiClient.completeRegistration({
        ...formData,
        code,
        role: 'client'
      });

      apiClient.saveTokens(response);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setStep('verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    await apiClient.sendVerificationCode({ email: formData.email });
  };

  if (step === 'verification') {
    return (
      <EmailVerification
        email={formData.email}
        onVerified={handleVerified}
        onBack={() => setStep('form')}
        onResend={handleResendCode}
        language={language}
      />
    );
  }

  if (step === 'completing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
            {language === 'EN' ? 'Completing registration...' : 'Completando registro...'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {language === 'EN' ? 'Please wait' : 'Por favor espera'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '48px 40px',
        borderRadius: '16px'
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
            padding: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          {t.back}
        </button>

        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 184, 230, 0.2) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <UserPlus size={32} color="var(--brand-cyan)" />
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            {t.title}
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {t.fullName}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={t.fullNamePlaceholder}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-cyan)';
                  e.target.style.background = 'rgba(0, 212, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {t.email}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-cyan)';
                  e.target.style.background = 'rgba(0, 212, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {t.password}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t.passwordPlaceholder}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-cyan)';
                  e.target.style.background = 'rgba(0, 212, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {t.confirmPassword}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-cyan)';
                  e.target.style.background = 'rgba(0, 212, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '8px',
              color: '#ff6b6b',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-teal) 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? t.sending : t.sendCode}
          </button>
        </form>
      </div>
    </div>
  );
};
