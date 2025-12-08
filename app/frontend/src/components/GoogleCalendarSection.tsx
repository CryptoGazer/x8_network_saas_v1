import React, { useState } from 'react';
import { Calendar, Check, X, AlertCircle, Eye, EyeOff, TestTube } from 'lucide-react';

interface GoogleCalendarSectionProps {
  enabled: boolean;
  integrationId: string;
  calendarId: string;
  apiToken: string;
  refreshToken: string;
  syncStatus: string;
  language: string;
  onUpdate: (field: string, value: any) => void;
  onTest: () => void;
}

export const GoogleCalendarSection: React.FC<GoogleCalendarSectionProps> = ({
  enabled,
  integrationId,
  calendarId,
  apiToken,
  refreshToken,
  syncStatus,
  language,
  onUpdate,
  onTest
}) => {
  const [showApiToken, setShowApiToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);

  const getStatusPill = () => {
    if (!enabled) {
      return {
        label: language === 'EN' ? 'Disabled' : 'Deshabilitado',
        color: 'var(--text-muted)',
        bg: 'rgba(128, 128, 128, 0.1)'
      };
    }

    if (syncStatus.startsWith('ok:')) {
      return {
        label: language === 'EN' ? 'Connected' : 'Conectado',
        color: 'var(--success-green)',
        bg: 'rgba(46, 213, 115, 0.15)'
      };
    }

    if (syncStatus.startsWith('error:')) {
      return {
        label: language === 'EN' ? 'Disconnected' : 'Desconectado',
        color: '#FF6B6B',
        bg: 'rgba(255, 107, 107, 0.15)'
      };
    }

    return {
      label: language === 'EN' ? 'Not Tested' : 'No Probado',
      color: '#FFB84D',
      bg: 'rgba(255, 184, 77, 0.15)'
    };
  };

  const statusPill = getStatusPill();

  return (
    <div className="glass-card" style={{
      padding: '20px',
      borderRadius: '12px',
      marginTop: '16px',
      border: enabled ? '1px solid var(--brand-cyan)' : '1px solid var(--glass-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} color="var(--brand-cyan)" />
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {language === 'EN' ? 'Google Calendar Integration' : 'Integración Google Calendar'}
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: statusPill.color,
            background: statusPill.bg
          }}>
            {statusPill.label}
          </span>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onUpdate('google_calendar_enabled', e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {language === 'EN' ? 'Enable' : 'Habilitar'}
            </span>
          </label>
        </div>
      </div>

      {enabled && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                {language === 'EN' ? 'INTEGRATION NAME / ID' : 'NOMBRE / ID INTEGRACIÓN'}
              </label>
              <input
                type="text"
                value={integrationId}
                onChange={(e) => onUpdate('google_calendar_integration_id', e.target.value)}
                placeholder={language === 'EN' ? "e.g. Anton's Calendar" : "ej. Calendario de Anton"}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                {language === 'EN' ? 'PRIMARY CALENDAR ID' : 'ID CALENDARIO PRINCIPAL'}
              </label>
              <input
                type="text"
                value={calendarId}
                onChange={(e) => onUpdate('google_calendar_primary_calendar_id', e.target.value)}
                placeholder="example@gmail.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                {language === 'EN' ? 'API TOKEN (MASKED)' : 'TOKEN API (ENMASCARADO)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiToken ? 'text' : 'password'}
                  value={apiToken}
                  onChange={(e) => onUpdate('google_calendar_api_token', e.target.value)}
                  placeholder="••••••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: showApiToken ? 'monospace' : 'inherit'
                  }}
                />
                <button
                  onClick={() => setShowApiToken(!showApiToken)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showApiToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                {language === 'EN' ? 'REFRESH TOKEN (MASKED)' : 'TOKEN RENOVACIÓN (ENMASCARADO)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRefreshToken ? 'text' : 'password'}
                  value={refreshToken}
                  onChange={(e) => onUpdate('google_calendar_refresh_token', e.target.value)}
                  placeholder="••••••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: showRefreshToken ? 'monospace' : 'inherit'
                  }}
                />
                <button
                  onClick={() => setShowRefreshToken(!showRefreshToken)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showRefreshToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid var(--brand-cyan)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              {language === 'EN' ? 'HOW TO GET TOKENS:' : 'CÓMO OBTENER TOKENS:'}
            </div>
            <ol style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>{language === 'EN' ? 'Create a project in Google Cloud Console' : 'Crea un proyecto en Google Cloud Console'}</li>
              <li>{language === 'EN' ? 'Enable Google Calendar API' : 'Habilita la API de Google Calendar'}</li>
              <li>{language === 'EN' ? 'Create OAuth 2.0 credentials' : 'Crea credenciales OAuth 2.0'}</li>
              <li>{language === 'EN' ? 'Paste the tokens above' : 'Pega los tokens arriba'}</li>
            </ol>
          </div>

          {syncStatus.startsWith('error:') && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid #FF6B6B',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#FF6B6B" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B6B', marginBottom: '2px' }}>
                  {language === 'EN' ? 'Sync Error' : 'Error de Sincronización'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {syncStatus.replace('error:', '')}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onTest}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <TestTube size={16} />
            {language === 'EN' ? 'Test Google Calendar Sync' : 'Probar Sincronización Google Calendar'}
          </button>
        </>
      )}
    </div>
  );
};
