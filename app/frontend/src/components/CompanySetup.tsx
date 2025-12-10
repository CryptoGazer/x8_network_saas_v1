import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Instagram, Facebook, Mail, Music } from 'lucide-react';

interface CompanySetupProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface Company {
  id: string;
  name: string;
  type: string;
  channels: string[];
  plan: string;
  activationDate: string;
  status: string;
}

export const CompanySetup: React.FC<CompanySetupProps> = ({ language, onNavigate }) => {
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('product');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('single');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [specialOfferEnabled, setSpecialOfferEnabled] = useState(false);
  const [specialOfferData, setSpecialOfferData] = useState<{ title: string; monthlyPrice: string; setupFee: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('specialOffer');
    if (saved) {
      try {
        const offer = JSON.parse(saved);
        if (offer.enabled) {
          setSpecialOfferEnabled(true);
          setSpecialOfferData({
            title: offer.title || 'Special Offer',
            monthlyPrice: offer.monthlyPrice || '€349',
            setupFee: offer.setupFee || '€149'
          });
        }
      } catch (e) {
        console.error('Failed to load special offer:', e);
      }
    }
  }, []);

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: '#0088cc' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: '#EA4335' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000' }
  ];

  const basePlans = [
    { id: 'single', label: 'Single — €249/mo + Setup €199' },
    { id: 'double', label: 'Double — €399/mo + Setup €299' },
    { id: 'growth', label: 'Growth — €599/mo + Setup €399' },
    { id: 'special', label: 'Special Offer — Custom €/mo + Custom Setup', color: '#F7C948' }
  ];

  const plans = specialOfferEnabled && specialOfferData
    ? [
        { id: 'special', label: `${specialOfferData.title} — ${specialOfferData.monthlyPrice}/mo + Setup ${specialOfferData.setupFee}` },
        ...basePlans
      ]
    : basePlans;

  const getMaxChannels = (planId: string): number => {
    switch (planId) {
      case 'single':
        return 1;
      case 'double':
        return 2;
      case 'growth':
        return 5;
      case 'special':
        return 999; // Don't touch special offer
      default:
        return 1;
    }
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => {
      const maxChannels = getMaxChannels(selectedPlan);

      // If channel is already selected, deselect it
      if (prev.includes(channelId)) {
        return prev.filter(c => c !== channelId);
      }

      // If we haven't reached the max, select it
      if (prev.length < maxChannels) {
        return [...prev, channelId];
      }

      // Max channels reached, don't add
      return prev;
    });
  };

  const handleActivateCompany = () => {
    if (!companyName.trim()) {
      alert(language === 'EN' ? 'Please enter a company name' : 'Por favor ingrese un nombre de empresa');
      return;
    }

    if (selectedChannels.length === 0) {
      alert(language === 'EN' ? 'Please select at least one channel' : 'Por favor seleccione al menos un canal');
      return;
    }

    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyName,
      type: companyType,
      channels: selectedChannels,
      plan: selectedPlan,
      activationDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);

    // Save to localStorage for WINDOW_3 (Knowledge Base)
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    setCompanyName('');
    setCompanyType('product');
    setSelectedChannels([]);
    setSelectedPlan('single');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <button
          id="backBtn"
          className="back-arrow"
          data-nav="WINDOW_0"
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
            transition: 'all var(--transition-fast)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            e.currentTarget.style.color = 'var(--brand-cyan)';
            e.currentTarget.style.borderColor = 'var(--brand-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
          }}
        >
          ← {language === 'EN' ? 'Back' : 'Volver'}
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Company Setup' : 'Configuración de Empresa'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN' ? 'Create and manage your companies' : 'Crea y gestiona tus empresas'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>

        {/* Create Company Form */}
        <div id="company.create" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
            {language === 'EN' ? 'Create a Company' : 'Crear una Empresa'}
          </h2>

          {/* Company Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {language === 'EN' ? 'Company Name' : 'Nombre de Empresa'}
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={language === 'EN' ? 'Enter company name' : 'Ingrese nombre de empresa'}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-cyan)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            />
          </div>

          {/* Company Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {language === 'EN' ? 'Type' : 'Tipo'}
            </label>
            <select
              id="companyType"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <option value="product">{language === 'EN' ? 'Product' : 'Producto'}</option>
              <option value="service">{language === 'EN' ? 'Service' : 'Servicio'}</option>
            </select>
          </div>

          {/* Channels */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              {language === 'EN' ? 'Channels' : 'Canales'}
            </label>
            <div
              id="channelSelector"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '12px'
              }}
            >
              {channels.map(channel => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                const maxChannels = getMaxChannels(selectedPlan);
                const isDisabled = !isSelected && selectedChannels.length >= maxChannels;
                return (
                  <button
                    key={channel.id}
                    data-channel={channel.id}
                    className="channel-icon"
                    onClick={() => toggleChannel(channel.id)}
                    disabled={isDisabled}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px',
                      background: isSelected ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--brand-cyan)' : '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                      transition: 'all var(--transition-fast)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isDisabled) {
                        e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isDisabled) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }
                    }}
                  >
                    <Icon size={28} style={{ color: isSelected ? 'var(--brand-cyan)' : channel.color }} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)'
                    }}>
                      {channel.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {language === 'EN' ? 'Select Plan' : 'Seleccionar Plan'}
            </label>
            <select
              id="planSelector"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: basePlans.find(p => p.id === selectedPlan)?.color || 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: selectedPlan === 'special' ? 600 : 400,
                outline: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {plans.map(plan => (
                <option
                  key={plan.id}
                  value={plan.id}
                  style={{
                    color: plan.color || 'var(--text-primary)',
                    fontWeight: plan.id === 'special' ? 600 : 400
                  }}
                >
                  {plan.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activate Button */}
          <div>
            <button
              id="activateCompanyBtn"
              onClick={handleActivateCompany}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 212, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
              }}
            >
              {language === 'EN' ? 'Activate Company' : 'Activar Empresa'}
            </button>
          </div>
        </div>

        {/* Companies Registry */}
        <div id="company.registry" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
            {language === 'EN' ? 'Registered Companies' : 'Empresas Registradas'}
          </h2>

          {companies.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              {language === 'EN' ? 'No companies registered yet' : 'No hay empresas registradas aún'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table id="companyTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Company Name' : 'Nombre'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Type' : 'Tipo'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Channels' : 'Canales'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Plan' : 'Plan'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Activation Date' : 'Fecha'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Status' : 'Estado'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {company.name}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {company.type === 'product'
                          ? (language === 'EN' ? 'Product' : 'Producto')
                          : (language === 'EN' ? 'Service' : 'Servicio')
                        }
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {company.channels.map(channelId => {
                            const channel = channels.find(c => c.id === channelId);
                            if (!channel) return null;
                            const Icon = channel.icon;
                            return (
                              <div
                                key={channelId}
                                title={channel.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '28px',
                                  height: '28px',
                                  background: 'var(--bg-secondary)',
                                  borderRadius: '6px',
                                  border: '1px solid var(--glass-border)'
                                }}
                              >
                                <Icon size={16} style={{ color: channel.color }} />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {company.activationDate}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'rgba(36, 211, 154, 0.1)',
                          color: 'var(--success-green)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {language === 'EN' ? 'Active' : 'Activo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
