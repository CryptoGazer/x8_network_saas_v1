import React from 'react';
import { Home, MessageSquare, Calendar, Plug, User } from 'lucide-react';

interface BottomNavProps {
  currentWindow: string;
  onNavigate: (window: string) => void;
  language: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentWindow, onNavigate, language }) => {
  const navItems = [
    {
      id: 'WINDOW_0',
      icon: Home,
      label: language === 'EN' ? 'Home' : 'Inicio'
    },
    {
      id: 'WINDOW_7',
      icon: MessageSquare,
      label: language === 'EN' ? 'Chats' : 'Conversaciones'
    },
    {
      id: 'WINDOW_13',
      icon: Calendar,
      label: language === 'EN' ? 'Calendar' : 'Calendario'
    },
    {
      id: 'WINDOW_5',
      icon: Plug,
      label: language === 'EN' ? 'Connect' : 'Conectar'
    },
    {
      id: 'WINDOW_12',
      icon: User,
      label: language === 'EN' ? 'Profile' : 'Perfil'
    }
  ];

  return (
    <nav className="bottom-nav mobile-only" role="navigation" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentWindow === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            type="button"
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
