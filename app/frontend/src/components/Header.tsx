import React, { useState, useEffect } from 'react';
import { Globe, Moon, Sun, User, LogOut } from 'lucide-react';

interface HeaderProps {
  onNavigate: (window: string) => void;
  onLogout: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout, language, onLanguageChange }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    return savedTheme === 'light' ? 'LIGHT' : 'DARK';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode') || 'dark';
    const root = document.documentElement;
    root.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme === 'light' ? 'LIGHT' : 'DARK');
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'EN' ? 'ES' : 'EN';
    onLanguageChange(newLang);
    localStorage.setItem('user_lang', newLang.toLowerCase());
  };

  const toggleTheme = () => {
    const newTheme = theme === 'DARK' ? 'LIGHT' : 'DARK';
    const themeValue = newTheme === 'LIGHT' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme-mode', themeValue);
    document.documentElement.setAttribute('data-theme', themeValue);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogout();
  };

  return (
    <header
      id="header"
      className="fixed top-0 left-0 right-0 z-50 glass-card"
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          x8work
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          id="header.lang"
          onClick={toggleLanguage}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 400,
            fontSize: '14px',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {language}
          <span style={{ fontSize: '12px', opacity: 0.6 }}>/ {language === 'EN' ? 'ES' : 'EN'}</span>
        </button>

        <button
          id="header.themeToggle"
          onClick={toggleTheme}
          aria-pressed={theme === 'LIGHT'}
          aria-label={`Switch to ${theme === 'DARK' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'DARK' ? 'light' : 'dark'} mode`}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '6px',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {theme === 'DARK' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            id="header.profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="glass-card"
            style={{
              padding: '8px',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              background: 'var(--glass-bg)',
              color: 'var(--brand-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <User size={24} />
          </button>

          {showProfileMenu && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '180px',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('WINDOW_12');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Account Settings
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger-red)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 92, 92, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
