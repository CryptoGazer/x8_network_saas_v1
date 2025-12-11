import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface IntegrationsTokensProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface AvailableChannels {
  whatsapp: boolean;
  telegram: boolean;
  instagram: boolean;
  facebook: boolean;
  email: boolean;
  tiktok: boolean;
  stripe_connect: boolean;
  google_calendar: boolean;
}

interface ConnectedIntegration {
  id: number;
  company_id: number;
  platform: string;
  status: string;
  platform_account_id?: string;
  platform_account_name?: string;
}

interface Company {
  id: number;
  name: string;
  company_id?: string;
}

export const IntegrationsTokens: React.FC<IntegrationsTokensProps> = ({ language, onNavigate }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [availableChannels, setAvailableChannels] = useState<AvailableChannels | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [channelLimit, setChannelLimit] = useState<number | null>(null);
  const [isEnterprise, setIsEnterprise] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappQR, setWhatsappQR] = useState('');
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const t = {
    en: {
      title: 'Integrations & Tokens',
      subtitle: 'Connect messaging channels and manage integrations',
      currentPlan: 'Current Plan',
      trialEnds: 'Trial ends',
      daysLeft: 'days left',
      channelLimit: 'You can select up to',
      channelsText: 'channels',
      channelsUsed: 'connected',
      limitReached: 'Channel limit reached! Disconnect a channel to add another.',
      back: 'Back',
      selectCompany: 'SELECT COMPANY',
      chooseCompany: 'Choose a company...',
      noCompany: 'No company selected',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connect: 'Connect',
      disconnect: 'Disconnect',
      comingSoon: 'Coming Soon',
      notAvailable: 'Not available in your plan',
      scanQR: 'Scan QR code with WhatsApp',
      enterPhone: 'WhatsApp Business Number',
      phonePlaceholder: '+1234567890',
      messagingChannels: 'Messaging Channels',
      systemIntegrations: 'System Integrations',
      connectGoogleCal: 'Connect Google Calendar',
      enterpriseSetup: 'Special Setup',
      enterpriseMessage: 'Enterprise plan requires custom integration setup. Please contact our support team.',
      contactSupport: 'Contact Support',
    },
    es: {
      title: 'Integraciones y Tokens',
      subtitle: 'Conecta canales de mensajería y gestiona integraciones',
      currentPlan: 'Plan Actual',
      trialEnds: 'Prueba termina',
      daysLeft: 'días restantes',
      channelLimit: 'Puedes seleccionar hasta',
      channelsText: 'canales',
      channelsUsed: 'conectados',
      limitReached: '¡Límite de canales alcanzado! Desconecta un canal para agregar otro.',
      back: 'Atrás',
      selectCompany: 'SELECCIONAR EMPRESA',
      chooseCompany: 'Elige una empresa...',
      noCompany: 'Ninguna empresa seleccionada',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      connect: 'Conectar',
      disconnect: 'Desconectar',
      comingSoon: 'Próximamente',
      notAvailable: 'No disponible en tu plan',
      scanQR: 'Escanea código QR con WhatsApp',
      enterPhone: 'Número de WhatsApp Business',
      phonePlaceholder: '+1234567890',
      messagingChannels: 'Canales de Mensajería',
      systemIntegrations: 'Integraciones del Sistema',
      connectGoogleCal: 'Conectar Google Calendar',
      enterpriseSetup: 'Configuración Especial',
      enterpriseMessage: 'El plan Enterprise requiere configuración de integración personalizada. Por favor contacta a nuestro equipo de soporte.',
      contactSupport: 'Contactar Soporte',
    }
  }[language.toLowerCase() as 'en' | 'es'];

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    }
  }, []);

  useEffect(() => {
    if (selectedCompany) loadIntegrations();
  }, [selectedCompany]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/integrations/available`, getAuthHeaders());
      setAvailableChannels(response.data.available_channels);
      setConnectedIntegrations(response.data.connected_integrations);
      setCurrentPlan(response.data.current_plan || 'free');
      setTrialEndDate(response.data.trial_end_date);
      setDaysLeft(response.data.days_left);
      setChannelLimit(response.data.channel_limit);
      setIsEnterprise(response.data.is_enterprise || false);
    } catch (err) {
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConnect = async () => {
    if (!selectedCompany || !whatsappNumber) return;
    setWhatsappLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/integrations/whatsapp/connect`,
        { company_id: selectedCompany, business_number: whatsappNumber },
        getAuthHeaders()
      );
      setWhatsappQR(response.data.qr_code);
      pollWhatsAppStatus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Connection failed');
    } finally {
      setWhatsappLoading(false);
    }
  };

  const pollWhatsAppStatus = () => {
    if (!selectedCompany) return;
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/integrations/whatsapp/status/${selectedCompany}`,
          getAuthHeaders()
        );
        if (response.data.connected) {
          setWhatsappQR('');
          clearInterval(interval);
          loadIntegrations();
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000);
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleWhatsAppDisconnect = async () => {
    if (!selectedCompany) return;
    try {
      await axios.delete(
        `${API_URL}/api/v1/integrations/whatsapp/disconnect/${selectedCompany}`,
        getAuthHeaders()
      );
      setWhatsappQR('');
      setWhatsappNumber('');
      loadIntegrations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Disconnect failed');
    }
  };

  const handleGoogleCalendarConnect = async () => {
    if (!selectedCompany) return;
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/integrations/google-calendar/auth`,
        { company_id: selectedCompany },
        getAuthHeaders()
      );
      window.location.href = response.data.auth_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Connection failed');
    }
  };

  const getStatus = (platform: string) => {
    const integration = connectedIntegrations.find(i => i.platform.toLowerCase() === platform.toLowerCase());
    return integration?.status || 'disconnected';
  };

  const isAvailable = (channel: keyof AvailableChannels) => {
    if (!availableChannels) return false;

    // Check if channel is available in plan
    const channelAvailable = availableChannels[channel];
    if (!channelAvailable) return false;

    // Check if user has reached their channel limit
    if (channelLimit !== null) {
      const connectedCount = connectedIntegrations.filter(i => i.status === 'connected').length;
      const isThisChannelConnected = connectedIntegrations.some(
        i => i.platform.toLowerCase() === channel.toLowerCase() && i.status === 'connected'
      );

      // If limit is reached and this channel is NOT already connected, disable it
      if (connectedCount >= channelLimit && !isThisChannelConnected) {
        return false;
      }
    }

    return true;
  };

  const renderChannel = (platform: string, key: keyof AvailableChannels, icon: string, content?: React.ReactNode) => {
    const available = isAvailable(key);
    const status = getStatus(platform);
    const connected = status === 'connected';

    return (
      <div
        key={platform}
        className="glass-card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          opacity: available ? 1 : 0.6,
          border: connected ? '1px solid var(--success-green)' : '1px solid var(--glass-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {platform}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {available ? (connected ? t.connected : t.disconnected) : t.notAvailable}
              </p>
            </div>
          </div>
          {connected && <Check size={20} style={{ color: 'var(--success-green)' }} />}
        </div>
        {available && content}
        {!available && (
          <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{t.notAvailable}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <button
        onClick={() => onNavigate && onNavigate('WINDOW_0')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          marginBottom: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} />
        {t.back}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {t.title}
          </h1>
          {selectedCompany && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '6px 16px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                textTransform: 'uppercase'
              }}>
                {t.currentPlan}: {currentPlan}
              </div>
              {currentPlan === 'free' && daysLeft !== null && (
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--accent-yellow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {t.trialEnds}: {daysLeft} {t.daysLeft}
                </div>
              )}
            </div>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.subtitle}</p>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
          {t.selectCompany}
        </label>
        <select
          value={selectedCompany || ''}
          onChange={(e) => setSelectedCompany(Number(e.target.value))}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="">{t.chooseCompany}</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCompany && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: 'var(--accent-yellow)' }} />
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>{t.noCompany}</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          marginTop: '16px',
          background: 'rgba(255, 71, 71, 0.1)',
          border: '1px solid rgba(255, 71, 71, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <X size={20} style={{ color: 'var(--danger-red)' }} />
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>{error}</p>
        </div>
      )}

      {selectedCompany && !loading && availableChannels && (
        <>
          {isEnterprise ? (
            <div style={{
              padding: '32px 24px',
              marginTop: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                marginBottom: '24px',
                display: 'inline-block'
              }}>
                {t.enterpriseSetup}
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
                {t.enterpriseMessage}
              </p>
              <button
                onClick={() => onNavigate && onNavigate('support')}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {t.contactSupport}
              </button>
            </div>
          ) : (
            <>
              {channelLimit !== null && (() => {
                const connectedCount = connectedIntegrations.filter(i => i.status === 'connected').length;
                const limitReached = connectedCount >= channelLimit;

                return (
                  <div style={{
                    padding: '12px 16px',
                    marginTop: '16px',
                    marginBottom: '16px',
                    background: limitReached ? 'rgba(255, 71, 71, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: limitReached ? '1px solid rgba(255, 71, 71, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <AlertCircle size={20} style={{ color: limitReached ? 'var(--danger-red)' : 'var(--brand-cyan)' }} />
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                      {limitReached ? t.limitReached : (
                        <>
                          {t.channelLimit} <strong>{channelLimit}</strong> {t.channelsText} ({connectedCount} {t.channelsUsed})
                        </>
                      )}
                    </p>
                  </div>
                );
              })()}
              <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {t.messagingChannels}
                </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {renderChannel('WhatsApp', 'whatsapp', '💬', (
                getStatus('WhatsApp') === 'connected' ? (
                  <button onClick={handleWhatsAppDisconnect} style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 71, 71, 0.1)',
                    border: '1px solid var(--danger-red)',
                    borderRadius: '8px',
                    color: 'var(--danger-red)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    {t.disconnect}
                  </button>
                ) : whatsappQR ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={whatsappQR} alt="QR Code" style={{ maxWidth: '200px', margin: '0 auto' }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{t.scanQR}</p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '8px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                      }}
                    />
                    <button onClick={handleWhatsAppConnect} disabled={whatsappLoading || !whatsappNumber} style={{
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: whatsappLoading || !whatsappNumber ? 'not-allowed' : 'pointer',
                      opacity: whatsappLoading || !whatsappNumber ? 0.6 : 1,
                    }}>
                      {t.connect}
                    </button>
                  </div>
                )
              ))}
              {renderChannel('Telegram', 'telegram', '✈️', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {renderChannel('Instagram', 'instagram', '📷', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {renderChannel('Facebook', 'facebook', '📘', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {renderChannel('TikTok', 'tiktok', '🎵', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {renderChannel('Email', 'email', '📧', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {t.systemIntegrations}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {renderChannel('Google Calendar', 'google_calendar' as any, '📅', (
                <button onClick={handleGoogleCalendarConnect} style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  {t.connectGoogleCal}
                </button>
              ))}
              {renderChannel('Stripe Connect', 'stripe_connect' as any, '💳', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
            </div>
          </div>
            </>
          )}
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Loader size={48} style={{ color: 'var(--brand-cyan)' }} />
        </div>
      )}
    </div>
  );
};
