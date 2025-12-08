import React, { useState, useEffect } from 'react';
import { Menu, User, Moon, Sun, Globe } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  onUserClick?: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  onUserClick,
  language,
  onLanguageChange
}) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme-mode', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLang = language === 'EN' ? 'ES' : 'EN';
    onLanguageChange(newLang);
    localStorage.setItem('user_lang', newLang.toLowerCase());
  };

  return (
    <div className="mobile-top-header">
      <button
        onClick={onMenuClick}
        className="mobile-icon-button"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h1 className="mobile-top-header-title">{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={toggleLanguage}
          className="mobile-icon-button"
          aria-label="Change language"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          {language}
        </button>

        <button
          onClick={toggleTheme}
          className="mobile-icon-button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          onClick={onUserClick}
          className="mobile-icon-button"
          aria-label="User profile"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
};

export const getWindowTitle = (window: string, language: string): string => {
  const titles: Record<string, { EN: string; ES: string }> = {
    WINDOW_0: { EN: 'Account Hub', ES: 'Centro de Cuentas' },
    WINDOW_1: { EN: 'Billing & Subscriptions', ES: 'Facturación' },
    WINDOW_2: { EN: 'Company Setup', ES: 'Configuración' },
    WINDOW_3: { EN: 'Knowledge Base', ES: 'Base de Conocimientos' },
    WINDOW_4: { EN: 'Analytics Dashboard', ES: 'Panel de Analíticas' },
    WINDOW_5: { EN: 'Integrations & Tokens', ES: 'Integraciones' },
    WINDOW_7: { EN: 'Conversation Center', ES: 'Centro de Conversaciones' },
    WINDOW_9: { EN: 'Support', ES: 'Soporte' },
    WINDOW_10: { EN: 'Activity Logs', ES: 'Registros de Actividad' },
    WINDOW_11: { EN: 'Training Studio', ES: 'Estudio de Entrenamiento' },
    WINDOW_12: { EN: 'Profile & Settings', ES: 'Perfil y Configuración' },
    WINDOW_13: { EN: 'Order Calendar', ES: 'Calendario de Pedidos' }
  };

  const title = titles[window];
  return title ? (language === 'EN' ? title.EN : title.ES) : 'x8work';
};
