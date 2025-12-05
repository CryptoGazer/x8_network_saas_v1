import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Users, Activity, TrendingUp } from 'lucide-react';
import { apiClient } from '../lib/api';

interface Manager {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

interface Stats {
  total_managers: number;
  total_clients: number;
  total_users: number;
}

export const AdminDashboard: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}> = ({ language, onLanguageChange, onLogout }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [managersData, statsData] = await Promise.all([
        apiClient.getAllManagers(),
        fetch('/api/v1/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }).then(r => r.json())
      ]);
      setManagers(managersData);
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
          {language === 'EN' ? 'Admin Dashboard' : 'Panel de Administración'}
        </h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={32} color="var(--brand-cyan)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Managers
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_managers || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={32} color="var(--brand-teal)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Clients
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_clients || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={32} color="var(--brand-neon)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Users
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_users || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Managers List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'Managers' : 'Gerentes'}
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {managers.map((manager) => (
              <div
                key={manager.id}
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
                    {manager.full_name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    {manager.email}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  Joined: {new Date(manager.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};