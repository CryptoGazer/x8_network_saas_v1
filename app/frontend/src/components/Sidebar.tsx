import React from 'react';
import {
  CreditCard,
  Building2,
  BookOpen,
  Plug,
  BarChart3,
  MessageSquare,
  Activity,
  GraduationCap,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (window: string) => void;
  currentWindow: string;
  language: string;
}

interface MenuItem {
  id: string;
  label: { en: string; es: string };
  icon: React.ReactNode;
  window: string;
}

const menuItems: MenuItem[] = [
  { id: 'billing', label: { en: 'Billing & Subscriptions', es: 'Facturación y Suscripciones' }, icon: <CreditCard size={20} />, window: 'WINDOW_1' },
  { id: 'company-setup', label: { en: 'Company Setup', es: 'Configuración de Empresa' }, icon: <Building2 size={20} />, window: 'WINDOW_2' },
  { id: 'knowledge-base', label: { en: 'Knowledge Base', es: 'Base de Conocimientos' }, icon: <BookOpen size={20} />, window: 'WINDOW_3' },
  { id: 'integrations', label: { en: 'Integrations & Tokens', es: 'Integraciones y Tokens' }, icon: <Plug size={20} />, window: 'WINDOW_5' },
  { id: 'analytics', label: { en: 'Analytics Dashboard', es: 'Panel de Análisis' }, icon: <BarChart3 size={20} />, window: 'WINDOW_4' },
  { id: 'conversation', label: { en: 'Conversation Center', es: 'Centro de Conversaciones' }, icon: <MessageSquare size={20} />, window: 'WINDOW_7' },
  { id: 'support', label: { en: 'Support Panel', es: 'Panel de Soporte' }, icon: <LifeBuoy size={20} />, window: 'WINDOW_9' },
  { id: 'activity-logs', label: { en: 'Activity Logs', es: 'Registros de Actividad' }, icon: <Activity size={20} />, window: 'WINDOW_10' },
  { id: 'training', label: { en: 'Training Studio', es: 'Estudio de Entrenamiento' }, icon: <GraduationCap size={20} />, window: 'WINDOW_11' }
];

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentWindow, language }) => {
  const lang = language.toLowerCase() as 'en' | 'es';

  return (
    <aside
      id="sidebar"
      className="glass-card neon-border"
      style={{
        position: 'fixed',
        top: '80px',
        left: '24px',
        width: '280px',
        height: 'calc(100vh - 104px)',
        padding: '24px 0',
        overflowY: 'hidden',
        zIndex: 40
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const isActive = currentWindow === item.window;
          const labelText = item.label[lang];
          return (
            <button
              key={item.id}
              data-nav={labelText}
              onClick={() => onNavigate(item.window)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--brand-cyan)' : '3px solid transparent',
                color: isActive ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--brand-cyan)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {item.icon}
              <span>{labelText}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
