import React from 'react';
import { X, Home, CreditCard, Building2, BookOpen, BarChart3, Link2, MessageSquare, Calendar, HelpCircle, Activity, GraduationCap, User } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentWindow: string;
  onNavigate: (window: string) => void;
  language: string;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentWindow,
  onNavigate,
  language
}) => {
  const handleNavigate = (window: string) => {
    onNavigate(window);
    onClose();
  };

  const menuItems = [
    { id: 'WINDOW_0', icon: Home, label: language === 'EN' ? 'Account Hub' : 'Centro de Cuentas' },
    { id: 'WINDOW_1', icon: CreditCard, label: language === 'EN' ? 'Billing' : 'Facturación' },
    { id: 'WINDOW_2', icon: Building2, label: language === 'EN' ? 'Company Setup' : 'Configuración' },
    { id: 'WINDOW_3', icon: BookOpen, label: language === 'EN' ? 'Knowledge Base' : 'Base de Conocimientos' },
    { id: 'WINDOW_4', icon: BarChart3, label: language === 'EN' ? 'Analytics' : 'Analíticas' },
    { id: 'WINDOW_5', icon: Link2, label: language === 'EN' ? 'Integrations' : 'Integraciones' },
    { id: 'WINDOW_7', icon: MessageSquare, label: language === 'EN' ? 'Conversations' : 'Conversaciones' },
    { id: 'WINDOW_13', icon: Calendar, label: language === 'EN' ? 'Calendar' : 'Calendario' },
    { id: 'WINDOW_9', icon: HelpCircle, label: language === 'EN' ? 'Support' : 'Soporte' },
    { id: 'WINDOW_10', icon: Activity, label: language === 'EN' ? 'Activity Logs' : 'Registros' },
    { id: 'WINDOW_11', icon: GraduationCap, label: language === 'EN' ? 'Training Studio' : 'Estudio' },
    { id: 'WINDOW_12', icon: User, label: language === 'EN' ? 'Profile' : 'Perfil' }
  ];

  return (
    <>
      <div
        className={`mobile-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`mobile-sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            x8work
          </h2>
          <button
            onClick={onClose}
            className="mobile-icon-button"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '16px 0' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentWindow === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '14px 20px',
                  border: 'none',
                  background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  color: isActive ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  borderLeft: isActive ? '3px solid var(--brand-cyan)' : '3px solid transparent',
                  textAlign: 'left'
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
