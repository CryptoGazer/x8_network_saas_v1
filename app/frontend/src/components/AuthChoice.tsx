import React from 'react';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthChoiceProps {
  onChoose: (choice: 'login' | 'register') => void;
  language: string;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({ onChoose, language }) => {
  const text = {
    EN: {
      title: 'x8work',
      subtitle: 'Welcome to X8 Network',
      description: 'Manage your business communications and analytics',
      login: 'Sign In',
      loginDesc: 'Access your account',
      register: 'Create Account',
      registerDesc: 'Start your journey',
    },
    ES: {
      title: 'x8work',
      subtitle: 'Bienvenido a X8 Network',
      description: 'Gestiona tus comunicaciones empresariales y análisis',
      login: 'Iniciar Sesión',
      loginDesc: 'Accede a tu cuenta',
      register: 'Crear Cuenta',
      registerDesc: 'Comienza tu viaje',
    }
  };

  const t = text[language as keyof typeof text] || text.EN;

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
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 700,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {t.title}
        </h1>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          {t.subtitle}
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '48px',
          fontSize: '16px'
        }}>
          {t.description}
        </p>

        <div style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: '1fr 1fr'
        }}>
          <button
            onClick={() => onChoose('login')}
            className="glass-card neon-border"
            style={{
              padding: '24px 16px',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              background: 'var(--glass-bg)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-cyan)';
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.background = 'var(--glass-bg)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(0, 212, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--brand-cyan)'
            }}>
              <LogIn size={24} color="var(--brand-cyan)" />
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {t.login}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                {t.loginDesc}
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoose('register')}
            className="glass-card neon-border"
            style={{
              padding: '24px 16px',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              background: 'var(--glass-bg)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-teal)';
              e.currentTarget.style.background = 'rgba(0, 179, 136, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.background = 'var(--glass-bg)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(0, 179, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--brand-teal)'
            }}>
              <UserPlus size={24} color="var(--brand-teal)" />
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {t.register}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                {t.registerDesc}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
