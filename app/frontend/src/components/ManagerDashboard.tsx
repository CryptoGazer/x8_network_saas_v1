import React, { useState, useEffect } from 'react';
import { Header } from './Header';
// import { ConversationCenter } from './ConversationCenter';  // Extract from sidebar
import { apiClient } from '../lib/api';

interface Client {
  id: number;
  email: string;
  full_name: string;
  subscription_tier: string;
  created_at: string;
}

export const ManagerDashboard: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}> = ({ language, onLanguageChange, onLogout }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await apiClient.getMyClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
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
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px'
      }}>
        {/* Conversation Center on left */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'Conversation Center' : 'Centro de Conversaciones'}
          </h2>
          {/* Add conversation center content */}
        </div>

        {/* Client list on right */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'My Clients' : 'Mis Clientes'}
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {clients.map((client) => (
              <div
                key={client.id}
                className="glass-card neon-border"
                onClick={() => setSelectedClient(client)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
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
                  marginTop: '8px'
                }}>
                  Plan: {client.subscription_tier}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};