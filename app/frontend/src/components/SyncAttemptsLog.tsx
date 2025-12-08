import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, User, X } from 'lucide-react';

interface SyncAttempt {
  timestamp: string;
  outcome: 'ok' | 'error';
  message: string;
  actor: string;
  attempt_id: string;
}

interface SyncAttemptsLogProps {
  attempts: SyncAttempt[];
  language: string;
  onClose: () => void;
}

export const SyncAttemptsLog: React.FC<SyncAttemptsLogProps> = ({ attempts, language, onClose }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'EN' ? 'en-US' : 'es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-card" style={{
        width: '500px',
        maxHeight: '600px',
        padding: '24px',
        borderRadius: '16px',
        maxWidth: '90%',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {language === 'EN' ? 'Sync Attempts Log' : 'Registro de Intentos de Sincronización'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            {language === 'EN' ? 'No sync attempts yet' : 'No hay intentos de sincronización aún'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attempts.map((attempt, idx) => (
              <div
                key={attempt.attempt_id}
                className="glass-card"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${attempt.outcome === 'ok' ? 'var(--success-green)' : '#FF6B6B'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {attempt.outcome === 'ok' ? (
                    <CheckCircle2 size={18} color="var(--success-green)" />
                  ) : (
                    <XCircle size={18} color="#FF6B6B" />
                  )}
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: attempt.outcome === 'ok' ? 'var(--success-green)' : '#FF6B6B'
                  }}>
                    {attempt.outcome === 'ok'
                      ? (language === 'EN' ? 'Success' : 'Éxito')
                      : (language === 'EN' ? 'Failed' : 'Fallido')
                    }
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {formatTimestamp(attempt.timestamp)}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {attempt.message}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <User size={12} />
                  {attempt.actor}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
