import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { TrendingUp, Clock, Calendar } from 'lucide-react';
import { apiClient } from '../utils/api';

interface Stats {
  clients_with_subscription: number;
  clients_on_trial: number;
  trial_clients: Array<{ id: number; email: string; full_name: string; days_remaining: number }>;
  paid_clients: Array<{ id: number; email: string; full_name: string; subscription_tier: string; days_until_renewal: number; renewal_date: string }>;
}

export const ManagerDashboard: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}> = ({ language, onLanguageChange, onLogout }) => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsData = await apiClient.getManagerStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <Header
        onNavigate={() => {}}
        onLogout={onLogout}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      <main style={{
        marginTop: '80px',
        padding: '24px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '32px'
        }}>
          {language === 'EN' ? 'Manager Dashboard' : 'Panel de Gerente'}
        </h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={32} color="var(--brand-teal)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Clients with Subscription' : 'Clientes con Suscripción'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.clients_with_subscription || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={32} color="var(--brand-neon)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Clients on Trial' : 'Clientes en Prueba'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.clients_on_trial || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Clients List */}
        {stats && stats.trial_clients && stats.trial_clients.length > 0 && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Clock size={24} color="var(--brand-neon)" />
              {language === 'EN' ? 'Trial Clients - Days Until Payment' : 'Clientes en Prueba - Días Hasta Pago'}
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {stats.trial_clients.map((client) => (
                <div
                  key={client.id}
                  className="glass-card neon-border"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {client.full_name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)'
                    }}>
                      {client.email}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: client.days_remaining <= 3 ? 'var(--error)' : client.days_remaining <= 7 ? 'var(--warning)' : 'var(--brand-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={20} />
                    {client.days_remaining} {language === 'EN' ? 'days left' : 'días restantes'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid Clients - Subscription Renewal */}
        {stats && stats.paid_clients && stats.paid_clients.length > 0 && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Calendar size={24} color="var(--brand-teal)" />
              {language === 'EN' ? 'Paid Clients - Subscription Renewal' : 'Clientes Pagados - Renovación de Suscripción'}
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {stats.paid_clients.map((client) => (
                <div
                  key={client.id}
                  className="glass-card neon-border"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {client.full_name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)'
                    }}>
                      {client.email}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {client.subscription_tier}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: client.days_until_renewal <= 7 ? 'var(--error)' : client.days_until_renewal <= 30 ? 'var(--warning)' : 'var(--brand-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Calendar size={20} />
                    {client.days_until_renewal} {language === 'EN' ? 'days to renewal' : 'días para renovación'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.trial_clients && stats.trial_clients.length === 0 && stats.paid_clients && stats.paid_clients.length === 0 && (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              {language === 'EN' ? 'No clients assigned yet' : 'Aún no hay clientes asignados'}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              {language === 'EN' ? 'Your assigned clients will appear here' : 'Tus clientes asignados aparecerán aquí'}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
