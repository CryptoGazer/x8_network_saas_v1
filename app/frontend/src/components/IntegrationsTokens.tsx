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
  const [selectedCompany, setSelectedCompany] = useState<number | null>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('integrations_selected_company_id');
    return saved ? parseInt(saved) : null;
  });
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
  const [companyChannels, setCompanyChannels] = useState<string[]>([]);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

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
    // Fetch companies from API
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/v1/companies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
          // Also update localStorage for compatibility
          localStorage.setItem('companies', JSON.stringify(data));

          // Verify the saved company still exists
          const savedCompanyId = localStorage.getItem('integrations_selected_company_id');
          if (savedCompanyId) {
            const companyId = parseInt(savedCompanyId);
            const companyExists = data.some((c: any) => c.id === companyId);
            if (!companyExists) {
              // Company no longer exists, clear the saved selection
              localStorage.removeItem('integrations_selected_company_id');
              setSelectedCompany(null);
            }
          }

          setCompaniesLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        // Fallback to localStorage
        const storedCompanies = localStorage.getItem('companies');
        if (storedCompanies) {
          setCompanies(JSON.parse(storedCompanies));
        }
        setCompaniesLoaded(true);
      }
    };

    fetchCompanies();
  }, []);

  // Load integrations when company is selected or when companies are loaded with saved selection
  useEffect(() => {
    if (selectedCompany && companiesLoaded) {
      loadIntegrations();
    }
  }, [selectedCompany, companiesLoaded]);

  const loadIntegrations = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      // Fetch company channels from PostgreSQL database
      const channelsResponse = await axios.get(
        `${API_URL}/api/v1/companies/${selectedCompany}/channels`,
        getAuthHeaders()
      );

      const companyChannelsList = channelsResponse.data; // Array of channel platform names
      setCompanyChannels(companyChannelsList);

      // Fetch user subscription/plan info
      const response = await axios.get(`${API_URL}/api/v1/integrations/available`, getAuthHeaders());
      setAvailableChannels(response.data.available_channels);
      setConnectedIntegrations(response.data.connected_integrations);
      setCurrentPlan(response.data.current_plan || 'free');
      setTrialEndDate(response.data.trial_end_date);
      setDaysLeft(response.data.days_left);
      setChannelLimit(response.data.channel_limit);
      setIsEnterprise(response.data.is_enterprise || false);

      console.log(`Company ${selectedCompany} has channels:`, companyChannelsList);
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

      const rawQr: string = response.data.qr_code;

      // если бэк уже вернул data:image/... – используем как есть
      const qrSrc = rawQr.startsWith('data:')
        ? rawQr
        : `data:image/png;base64,${rawQr}`;

      setWhatsappQR(qrSrc);
      pollWhatsAppStatus();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      // detail может быть строкой или объектом
      if (typeof detail === 'string') {
        setError(detail);
      } else if (detail && typeof detail === 'object') {
        // попытаемся вывести message или хотя бы JSON
        setError(detail.message || JSON.stringify(detail));
      } else {
        setError('Connection failed');
      }
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
          onChange={(e) => {
            const newCompanyId = Number(e.target.value);
            setSelectedCompany(newCompanyId);
            // Persist to localStorage
            if (newCompanyId) {
              localStorage.setItem('integrations_selected_company_id', newCompanyId.toString());
            } else {
              localStorage.removeItem('integrations_selected_company_id');
            }
          }}
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
          {currentPlan === 'free' && (() => {
            // For FREE plan users, show only channels that belong to this company in the database
            if (!companyChannels || companyChannels.length === 0) {
              return (
                <div style={{
                  padding: '32px 24px',
                  marginTop: '16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
                    {language === 'EN'
                      ? 'Please select a channel in Company Setup first.'
                      : 'Por favor selecciona un canal en Configuración de Empresa primero.'}
                  </p>
                </div>
              );
            }

            // Map channel ID to display name
            const channelMap: Record<string, { name: string; key: keyof AvailableChannels; icon: string }> = {
              'whatsapp': { name: 'WhatsApp', key: 'whatsapp', icon: '💬' },
              'telegram': { name: 'Telegram', key: 'telegram', icon: '✈️' },
              'instagram': { name: 'Instagram', key: 'instagram', icon: '📷' },
              'facebook': { name: 'Facebook', key: 'facebook', icon: '📘' },
              'gmail': { name: 'Email', key: 'email', icon: '📧' },
              'email': { name: 'Email', key: 'email', icon: '📧' },
              'tiktok': { name: 'TikTok', key: 'tiktok', icon: '🎵' }
            };

            // Get first channel from company channels (FREE plan = only 1 channel)
            const selectedChannel = companyChannels[0].toLowerCase();
            const channelInfo = channelMap[selectedChannel];

            if (!channelInfo) {
              console.warn(`Unknown channel type: ${selectedChannel}`);
              return null;
            }

            return (
              <div style={{ marginTop: '32px' }}>
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle size={20} style={{ color: 'var(--accent-yellow)' }} />
                  <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                    {language === 'EN'
                      ? `FREE plan: You selected ${channelInfo.name}. Upgrade to connect more channels.`
                      : `Plan GRATIS: Seleccionaste ${channelInfo.name}. Actualiza para conectar más canales.`}
                  </p>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {channelInfo.name} {language === 'EN' ? 'Setup' : 'Configuración'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {selectedChannel === 'whatsapp' && renderChannel('WhatsApp', 'whatsapp', '💬', (
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
                  {selectedChannel !== 'whatsapp' && renderChannel(
                    channelInfo.name,
                    channelInfo.key,
                    channelInfo.icon,
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>
                  )}
                </div>
              </div>
            );
          })()}

          {currentPlan !== 'free' && isEnterprise && (
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
          )}

          {currentPlan !== 'free' && !isEnterprise && (
            <>
              {/* Show info about channels available for this company */}
              <div style={{
                padding: '12px 16px',
                marginTop: '16px',
                marginBottom: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle size={20} style={{ color: 'var(--brand-cyan)' }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                  {language === 'EN'
                    ? `This company has ${companyChannels.length} channel(s): ${companyChannels.join(', ')}`
                    : `Esta empresa tiene ${companyChannels.length} canal(es): ${companyChannels.join(', ')}`
                  }
                </p>
              </div>

              <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {t.messagingChannels}
                </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Only render channels that belong to this company */}
              {companyChannels.includes('whatsapp') && renderChannel('WhatsApp', 'whatsapp', '💬', (
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
              {companyChannels.includes('telegram') && renderChannel('Telegram', 'telegram', '✈️', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {companyChannels.includes('instagram') && renderChannel('Instagram', 'instagram', '📷', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {companyChannels.includes('facebook') && renderChannel('Facebook', 'facebook', '📘', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {companyChannels.includes('tiktok') && renderChannel('TikTok', 'tiktok', '🎵', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
              {(companyChannels.includes('email') || companyChannels.includes('gmail')) && renderChannel('Email', 'email', '📧', <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{t.comingSoon}</p>)}
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
          )
        }
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
