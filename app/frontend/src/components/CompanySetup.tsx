import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Instagram, Facebook, Mail, Music } from 'lucide-react';

interface CompanySetupProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface Company {
  id: number;
  company_id: string;
  name: string;
  company_type: 'product' | 'service';
  shop_type: string;
  user_id: number;
  status: string;
  total_messages: number;
  type1_count: number;
  type2_count: number;
  type2_unpaid: number;
  type3_count: number;
  type3_paid: number;
  avg_response_time: number;
  subscription_ends: string | null;
  created_at: string;
  updated_at: string | null;
  channels: string[];
}

export const CompanySetup: React.FC<CompanySetupProps> = ({ language, onNavigate }) => {
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('product');
  const [shopType, setShopType] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('single');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [specialOfferEnabled, setSpecialOfferEnabled] = useState(false);
  const [specialOfferData, setSpecialOfferData] = useState<{ title: string; monthlyPrice: string; setupFee: string } | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free'); // Current user's plan from backend

  const hasProductCompany = companies.some(c => c.company_type === 'product');
  const hasServiceCompany = companies.some(c => c.company_type === 'service');
  const maxCompaniesReached = companies.length >= 2;

  const canCreateMoreCompanies =
    !maxCompaniesReached &&
    !(companyType === 'product' && hasProductCompany) &&
    !(companyType === 'service' && hasServiceCompany);


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

    // Clean up Test Service company from localStorage
    cleanUpTestCompanies();

    // Fetch current user's plan from backend
    fetchCurrentUserPlan();

    // Fetch companies from backend
    fetchCompanies();

    if (hasProductCompany && !hasServiceCompany) {
      setCompanyType('service');
    } else if (!hasProductCompany && hasServiceCompany) {
      setCompanyType('product');
    } else if (!hasProductCompany && !hasServiceCompany) {
      setCompanyType('product');
    }
  }, [hasProductCompany, hasServiceCompany]);

  const cleanUpTestCompanies = () => {
    try {
      const storedCompanies = localStorage.getItem('companies');
      if (storedCompanies) {
        const parsed = JSON.parse(storedCompanies);
        // Remove any test companies
        const filtered = parsed.filter((c: Company) =>
          !c.name.toLowerCase().includes('test') &&
          c.name !== 'Test Service'
        );
        localStorage.setItem('companies', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Failed to clean up test companies:', e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/v1/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        // Also update localStorage for compatibility
        localStorage.setItem('companies', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchCurrentUserPlan = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/v1/integrations/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentUserPlan(data.current_plan || 'free');

      // If user has FREE plan, auto-select it
      if (data.current_plan === 'free') {
        setSelectedPlan('free');
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
    }
  };

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: '#0088cc' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: '#EA4335' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000' }
  ];

  const basePlans = [
    { id: 'free', label: 'FREE — Trial (1 channel)', disabled: currentUserPlan !== 'free' },
    { id: 'single', label: 'Single — €249/mo + Setup €199', disabled: currentUserPlan === 'free' },
    { id: 'double', label: 'Double — €399/mo + Setup €299', disabled: currentUserPlan === 'free' },
    { id: 'growth', label: 'Growth — €599/mo + Setup €399', disabled: currentUserPlan === 'free' },
    { id: 'special', label: 'Special Offer — Custom €/mo + Custom Setup', color: '#F7C948', disabled: currentUserPlan === 'free' }
  ];

  const plans = specialOfferEnabled && specialOfferData
    ? [
        {
          id: 'special',
          label: `${specialOfferData.title} — ${specialOfferData.monthlyPrice}/mo + Setup ${specialOfferData.setupFee}`,
          color: '#F7C948',
          disabled: currentUserPlan === 'free'
        },
        ...basePlans
      ]
    : basePlans;

  const getMaxChannels = (planId: string): number => {
    switch (planId) {
      case 'free':
        return 1; // FREE plan allows only 1 channel
      case 'single':
        return 1;
      case 'double':
        return 2;
      case 'growth':
        return 4; // Growth plan allows 4 channels
      case 'special':
        return 6; // Special offer unlocks all 6 channels
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

  const handleActivateCompany = async () => {
    if (maxCompaniesReached) {
      alert(
        language === 'EN'
          ? 'You already have the maximum number of companies (2).'
          : 'Ya tienes el número máximo de empresas (2).'
      );
      return;
    }

    const hasSameType = companies.some(
      c => c.company_type === companyType
    );
    if (hasSameType) {
      alert(
        language === 'EN'
          ? `You already have a ${companyType === 'product' ? 'Product' : 'Service'} company.`
          : `Ya tienes una empresa de tipo ${companyType === 'product' ? 'Producto' : 'Servicio'}.`
      );
      return;
    }

    if (!companyName.trim()) {
      alert(language === 'EN' ? 'Please enter a company name' : 'Por favor ingrese un nombre de empresa');
      return;
    }

    if (!shopType.trim()) {
      alert(language === 'EN' ? 'Please enter a shop type' : 'Por favor ingrese un tipo de negocio');
      return;
    }

    if (selectedChannels.length === 0) {
      alert(language === 'EN' ? 'Please select at least one channel' : 'Por favor seleccione al menos un canal');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      const response = await fetch(`${API_URL}/api/v1/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: companyName,
          company_type: companyType,  // Product or Service (for Supabase table)
          shop_type: shopType,  // User's manual description of business type
          channels: selectedChannels,
          plan: selectedPlan
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create company');
      }

      await response.json();

      // Refresh companies list
      await fetchCompanies();

      alert(language === 'EN'
        ? `Company "${companyName}" created successfully with ${selectedChannels.length} channel(s)!`
        : `Empresa "${companyName}" creada exitosamente con ${selectedChannels.length} canal(es)!`
      );

      // Reset form
      setCompanyName('');
      setCompanyType('product');
      setShopType('');
      setSelectedChannels([]);
      setSelectedPlan(currentUserPlan === 'free' ? 'free' : 'single');
    } catch (error: any) {
      alert(language === 'EN'
        ? `Failed to create company: ${error.message}`
        : `Error al crear empresa: ${error.message}`
      );
      console.error('Failed to create company:', error);
    }
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
              {/* <option value="product">{language === 'EN' ? 'Product' : 'Producto'}</option>
              <option value="service">{language === 'EN' ? 'Service' : 'Servicio'}</option> */}
              <option
                value="product"
                disabled={hasProductCompany}
              >
                {language === 'EN' ? 'Product' : 'Producto'}
                {hasProductCompany
                  ? language === 'EN' ? ' (already created)' : ' (ya creada)'
                  : ''}
              </option>
              <option
                value="service"
                disabled={hasServiceCompany}
              >
                {language === 'EN' ? 'Service' : 'Servicio'}
                {hasServiceCompany
                  ? language === 'EN' ? ' (already created)' : ' (ya creada)'
                  : ''}
              </option>
            </select>
          </div>

          {/* Shop Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {language === 'EN' ? 'Shop Type' : 'Tipo de Negocio'}
            </label>
            <input
              type="text"
              value={shopType}
              onChange={(e) => setShopType(e.target.value)}
              placeholder={language === 'EN' ? 'e.g., Restaurant, Hotel, Retail Store' : 'ej., Restaurante, Hotel, Tienda'}
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
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                // Clear all selected channels when plan changes
                setSelectedChannels([]);
              }}
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
                  disabled={plan.disabled}
                  style={{
                    color: plan.disabled ? 'var(--text-muted)' : (plan.color || 'var(--text-primary)'),
                    fontWeight: plan.id === 'special' ? 600 : 400,
                    opacity: plan.disabled ? 0.5 : 1
                  }}
                >
                  {plan.label} {plan.disabled && currentUserPlan === 'free' ? '(Upgrade Required)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Activate Button */}
          {maxCompaniesReached && (
            <p style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              {language === 'EN'
                ? 'You already created the maximum number of companies (1 Product and 1 Service).'
                : 'Ya has creado el número máximo de empresas (1 Producto y 1 Servicio).'}
            </p>
          )}
          <div>
            <button
              id="activateCompanyBtn"
              onClick={handleActivateCompany}
              disabled={!canCreateMoreCompanies}
              style={{
                opacity: canCreateMoreCompanies ? 1 : 0.5,
                padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: canCreateMoreCompanies ? 'pointer' : 'not-allowed',
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
              {language === 'EN' ? 'Create Company' : 'Crear Empresa'}
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
                      {language === 'EN' ? 'Messages' : 'Mensajes'}
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {language === 'EN' ? 'Created' : 'Creado'}
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
                        {company.company_type === 'product'
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
                        {company.total_messages || 0}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: company.status === 'Active' ? 'rgba(36, 211, 154, 0.1)' : 'rgba(255, 92, 92, 0.1)',
                          color: company.status === 'Active' ? 'var(--success-green)' : 'var(--danger-red)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
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
