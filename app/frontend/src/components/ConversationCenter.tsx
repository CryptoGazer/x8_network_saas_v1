import React, { useState, useMemo } from 'react';
import { ArrowLeft, Download, Search, ExternalLink, Copy, MessageSquare, Calendar, Filter, CheckCircle2 } from 'lucide-react';
import Chart from 'react-apexcharts';
import { ConversationCard } from './ConversationCard';

interface ConversationCenterProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface Company {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  status: 'Active' | 'Inactive';
  tariff: string;
}

interface PurchaseRow {
  payment_link_id: string;
  contact: string;
  shop_type: string;
  purchase_date?: string;
  conversation_start_date?: string;
  conversation_language?: string;
  order_status: string;
  total_sum: number;
  goods_bought: string;
  city?: string;
  payment_link: string;
  docs_link: string;
  client_type: 'Type1' | 'Type2' | 'Type3';
  origin_channel: string;
  product_fulfillment_date?: string;
  service_execution_date?: string;
  order_calendar_sync: 'auto' | 'manual';
  synced_to_order_calendar: boolean;
  order_calendar_id?: string;
}

type DatePreset = '7days' | '30days' | 'all' | 'custom';
type ChannelTab = 'all' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'gmail' | 'tiktok';

export const ConversationCenter: React.FC<ConversationCenterProps> = ({ language, onNavigate }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<ChannelTab>('whatsapp');
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationPanel, setShowConversationPanel] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<PurchaseRow | null>(null);
  const [copiedText, setCopiedText] = useState('');

  const demoCompanies: Company[] = [];

  const whatsappPurchases: PurchaseRow[] = [];
  const gmailPurchases: PurchaseRow[] = [];
  const facebookPurchases: PurchaseRow[] = [];
  const instagramPurchases: PurchaseRow[] = [];
  const telegramPurchases: PurchaseRow[] = [];
  const tiktokPurchases: PurchaseRow[] = [];

  const getCurrentPurchases = (): PurchaseRow[] => {
    if (activeTab === 'all') {
      return allPurchases.sort((a, b) =>
        new Date(a.purchase_date || '').getTime() - new Date(b.purchase_date || '').getTime()
      );
    }
    switch (activeTab) {
      case 'whatsapp': return whatsappPurchases;
      case 'gmail': return gmailPurchases;
      case 'facebook': return facebookPurchases;
      case 'instagram': return instagramPurchases;
      case 'telegram': return telegramPurchases;
      case 'tiktok': return tiktokPurchases;
      default: return [];
    }
  };

  const allPurchases = useMemo(() => {
    return [
      ...whatsappPurchases,
      ...gmailPurchases,
      ...facebookPurchases,
      ...instagramPurchases,
      ...telegramPurchases,
      ...tiktokPurchases
    ];
  }, []);

  const filteredPurchases = useMemo(() => {
    const purchases = getCurrentPurchases();
    if (!searchQuery) return purchases;
    return purchases.filter(p =>
      p.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shop_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.goods_bought.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery]);

  const stats = useMemo(() => {
    const type1 = allPurchases.filter(p => p.client_type === 'Type1').length;
    const type2 = allPurchases.filter(p => p.client_type === 'Type2').length;
    const type3 = allPurchases.filter(p => p.client_type === 'Type3').length;
    const type2Sum = allPurchases.filter(p => p.client_type === 'Type2').reduce((sum, p) => sum + p.total_sum, 0);
    const type3Sum = allPurchases.filter(p => p.client_type === 'Type3').reduce((sum, p) => sum + p.total_sum, 0);

    return {
      type1Count: type1,
      type2Count: type2,
      type3Count: type3,
      type2Sum: type2Sum,
      type3Sum: type3Sum,
      totalIncoming: 0,
      totalOutgoing: 0,
      avgResponse: 0
    };
  }, [allPurchases]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleExportCSV = () => {
    alert(language === 'EN'
      ? 'Exporting ZIP with CSVs and summary_metrics.csv...'
      : 'Exportando ZIP con CSVs y summary_metrics.csv...');
  };

  const openConversation = (purchase: PurchaseRow) => {
    setSelectedConversation(purchase);
    setShowConversationPanel(true);
  };

  const lineChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#00D4FF', '#2ED5B3'],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#8B9AAF' } }
    },
    yaxis: {
      labels: { style: { colors: '#8B9AAF' } }
    },
    grid: {
      borderColor: 'rgba(139, 154, 175, 0.1)'
    },
    legend: {
      labels: { colors: '#E2E8F0' }
    }
  };

  const lineChartSeries = [
    { name: language === 'EN' ? 'Incoming' : 'Entrantes', data: [18, 22, 15, 28, 20, 17, 20] },
    { name: language === 'EN' ? 'Outgoing' : 'Salientes', data: [12, 15, 10, 18, 14, 11, 14] }
  ];

  const donutChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    theme: { mode: 'dark' },
    labels: ['Type1', 'Type2', 'Type3'],
    colors: ['#8B9AAF', '#FFB84D', '#2ED5B3'],
    legend: {
      labels: { colors: '#E2E8F0' },
      position: 'bottom'
    },
    dataLabels: {
      style: { colors: ['#1A1F2E'] }
    }
  };

  const donutChartSeries = [stats.type1Count, stats.type2Count, stats.type3Count];

  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      background: 'transparent'
    },
    theme: { mode: 'dark' },
    labels: ['WhatsApp', 'Instagram', 'Telegram', 'Facebook', 'Gmail', 'TikTok'],
    colors: ['#25D366', '#E4405F', '#0088cc', '#1877F2', '#EA4335', '#000000'],
    legend: {
      labels: { colors: '#E2E8F0' },
      position: 'bottom'
    }
  };

  const pieChartSeries = [126, 40, 20, 10, 4, 2];

  return (
    <div style={{ padding: '24px', maxWidth: '100%' }}>
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
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Conversation Center' : 'Centro de Conversaciones'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Unified purchase and dialog feed across messaging channels'
            : 'Feed unificado de compras y diálogos en todos los canales de mensajería'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
            <Calendar size={18} color="var(--brand-cyan)" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: 1
              }}
            >
              <option value="7days">{language === 'EN' ? 'Last 7 days' : 'Últimos 7 días'}</option>
              <option value="30days">{language === 'EN' ? 'Last 30 days' : 'Últimos 30 días'}</option>
              <option value="all">{language === 'EN' ? 'All time' : 'Todo el tiempo'}</option>
              <option value="custom">{language === 'EN' ? 'Custom range' : 'Rango personalizado'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
            <Filter size={18} color="var(--brand-cyan)" />
            <select
              value={selectedCompany?.id || ''}
              onChange={(e) => {
                const company = demoCompanies.find(p => p.id === e.target.value);
                setSelectedCompany(company || null);
              }}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: 1
              }}
            >
              <option value="">{language === 'EN' ? 'Select Company' : 'Seleccionar Empresa'}</option>
              {demoCompanies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
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
            <Download size={18} />
            {language === 'EN' ? 'Export CSV' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {selectedCompany && (
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CheckCircle2 size={20} color="var(--success-green)" />
          <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              {selectedCompany.name}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: selectedCompany.status === 'Active' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(139, 154, 175, 0.15)',
                color: selectedCompany.status === 'Active' ? 'var(--success-green)' : 'var(--text-muted)'
              }}>
                {selectedCompany.status}
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(0, 212, 255, 0.15)',
                color: 'var(--brand-cyan)'
              }}>
                {selectedCompany.type}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                {language === 'EN' ? 'Tariff:' : 'Tarifa:'} {selectedCompany.tariff}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {(['all', 'whatsapp', 'telegram', 'instagram', 'facebook', 'gmail', 'tiktok'] as ChannelTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${activeTab === tab ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
              borderRadius: '8px',
              color: activeTab === tab ? 'var(--brand-cyan)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'all' ? (language === 'EN' ? 'All Channels' : 'Todos') : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'EN' ? 'Search purchases...' : 'Buscar compras...'}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPurchases.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {language === 'EN' ? 'No conversations found' : 'No se encontraron conversaciones'}
            </div>
          ) : (
            filteredPurchases.map((purchase, idx) => (
              <ConversationCard
                key={idx}
                conversation={purchase}
                language={language}
                onClick={() => {
                  setSelectedConversation(purchase);
                  setShowConversationPanel(true);
                }}
              />
            ))
          )}
        </div>

        <div className="desktop-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'LINK ID' : 'ID ENLACE'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'CONTACT' : 'CONTACTO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'DIALOG START DATE' : 'FECHA INICIO DIÁLOGO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'DIALOG LANGUAGE' : 'IDIOMA DIÁLOGO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'TYPE' : 'TIPO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'GOODS' : 'ARTÍCULOS'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'CITY' : 'CIUDAD'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'TOTAL' : 'TOTAL'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'PRODUCT DATE' : 'FECHA PRODUCTO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'SERVICE DATE' : 'FECHA SERVICIO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'CLIENT TYPE' : 'TIPO CLIENTE'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'SYNC MODE' : 'MODO SINC'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'SYNCED' : 'SINCRONIZADO'}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'EN' ? 'ACTIONS' : 'ACCIONES'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {purchase.payment_link_id}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--brand-cyan)', fontSize: '13px', fontWeight: 600 }}>
                        {purchase.contact}
                      </span>
                      <button
                        onClick={() => handleCopy(purchase.contact)}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          opacity: copiedText === purchase.contact ? 1 : 0.5
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {purchase.conversation_start_date
                      ? new Date(purchase.conversation_start_date).toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {purchase.conversation_language || '-'}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontSize: '13px' }}>
                    {purchase.shop_type}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '250px' }}>
                    {purchase.goods_bought}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {purchase.city}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    €{purchase.total_sum}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {purchase.product_fulfillment_date
                      ? new Date(purchase.product_fulfillment_date).toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {purchase.service_execution_date
                      ? new Date(purchase.service_execution_date).toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: purchase.client_type === 'Type1' ? 'rgba(255, 184, 77, 0.15)' :
                                  purchase.client_type === 'Type2' ? 'rgba(255, 107, 107, 0.15)' :
                                  'rgba(46, 213, 115, 0.15)',
                      color: purchase.client_type === 'Type1' ? '#FFB84D' :
                             purchase.client_type === 'Type2' ? '#FF6B6B' :
                             'var(--success-green)'
                    }}>
                      {purchase.client_type === 'Type1' ? (language === 'EN' ? 'Type 1 — no link sent' : 'Tipo 1 — sin enlace') :
                       purchase.client_type === 'Type2' ? (language === 'EN' ? 'Type 2 — unpaid' : 'Tipo 2 — no pagado') :
                       (language === 'EN' ? 'Type 3 — paid' : 'Tipo 3 — pagado')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: purchase.order_calendar_sync === 'auto' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 184, 77, 0.15)',
                      color: purchase.order_calendar_sync === 'auto' ? 'var(--brand-cyan)' : '#FFB84D',
                      textTransform: 'capitalize'
                    }}>
                      {purchase.order_calendar_sync}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    {purchase.synced_to_order_calendar ? (
                      <CheckCircle2 size={16} color="var(--success-green)" />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => window.open(purchase.payment_link, '_blank')}
                        style={{
                          padding: '6px',
                          background: 'rgba(0, 212, 255, 0.1)',
                          border: '1px solid var(--brand-cyan)',
                          borderRadius: '6px',
                          color: 'var(--brand-cyan)',
                          cursor: 'pointer'
                        }}
                        title={language === 'EN' ? 'Open payment link' : 'Abrir enlace de pago'}
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => window.open(purchase.docs_link, '_blank')}
                        style={{
                          padding: '6px',
                          background: 'rgba(46, 213, 115, 0.1)',
                          border: '1px solid var(--success-green)',
                          borderRadius: '6px',
                          color: 'var(--success-green)',
                          cursor: 'pointer'
                        }}
                        title={language === 'EN' ? 'Open docs' : 'Abrir documentos'}
                      >
                        <ExternalLink size={14} />
                      </button>
                      {purchase.order_calendar_sync === 'manual' && !purchase.synced_to_order_calendar && (
                        <button
                          onClick={() => alert(language === 'EN'
                            ? `Syncing ${purchase.contact} to Order Calendar...`
                            : `Sincronizando ${purchase.contact} al Calendario de Órdenes...`)}
                          style={{
                            padding: '6px',
                            background: 'rgba(0, 212, 255, 0.1)',
                            border: '1px solid var(--brand-cyan)',
                            borderRadius: '6px',
                            color: 'var(--brand-cyan)',
                            cursor: 'pointer'
                          }}
                          title={language === 'EN' ? 'Sync to Order Calendar' : 'Sincronizar al Calendario de Órdenes'}
                        >
                          <Calendar size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => openConversation(purchase)}
                        style={{
                          padding: '6px',
                          background: 'rgba(255, 184, 77, 0.1)',
                          border: '1px solid #FFB84D',
                          borderRadius: '6px',
                          color: '#FFB84D',
                          cursor: 'pointer'
                        }}
                        title={language === 'EN' ? 'Open conversation' : 'Abrir conversación'}
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPurchases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {language === 'EN' ? 'No purchases found' : 'No se encontraron compras'}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
            {language === 'EN' ? 'TYPE 1 - NOT REACHED' : 'TIPO 1 - NO ALCANZADO'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {stats.type1Count}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {language === 'EN' ? 'Contacts reached' : 'Contactos alcanzados'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
            {language === 'EN' ? 'TYPE 2 - LINK SENT' : 'TIPO 2 - ENLACE ENVIADO'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#FFB84D', marginBottom: '4px' }}>
            {stats.type2Count}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            €{stats.type2Sum} {language === 'EN' ? 'in pending payments' : 'en pagos pendientes'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
            {language === 'EN' ? 'TYPE 3 - PAID' : 'TIPO 3 - PAGADO'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success-green)', marginBottom: '4px' }}>
            {stats.type3Count}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            €{stats.type3Sum} {language === 'EN' ? 'received' : 'recibido'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
            {language === 'EN' ? 'AVG RESPONSE TIME' : 'TIEMPO RESPUESTA PROM'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
            {stats.avgResponse}s
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {language === 'EN' ? 'Average reply time' : 'Tiempo promedio de respuesta'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Incoming vs Outgoing' : 'Entrantes vs Salientes'}
          </h3>
          <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={280} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            {language === 'EN'
              ? 'Shows the balance between messages received from clients and responses sent by operators. Helps evaluate team workload and response activity.'
              : 'Muestra el balance entre mensajes recibidos de clientes y respuestas enviadas por operadores. Ayuda a evaluar la carga de trabajo y actividad de respuesta del equipo.'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Client Type Distribution' : 'Distribución por Tipo'}
          </h3>
          <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={280} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            {language === 'EN'
              ? 'Type 1 – no link sent, Type 2 – unpaid, Type 3 – paid. Distribution shows conversion funnel progress and payment completion rates.'
              : 'Tipo 1 – sin enlace enviado, Tipo 2 – no pagado, Tipo 3 – pagado. La distribución muestra el progreso del embudo de conversión y las tasas de finalización de pago.'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Channel Share' : 'Distribución por Canal'}
          </h3>
          <Chart options={pieChartOptions} series={pieChartSeries} type="pie" height={280} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            {language === 'EN'
              ? 'Percentage of conversations by communication channel. Useful for resource allocation and identifying most effective channels for customer engagement.'
              : 'Porcentaje de conversaciones por canal de comunicación. Útil para asignación de recursos e identificación de los canales más efectivos para la interacción con clientes.'}
          </p>
        </div>
      </div>

      {showConversationPanel && selectedConversation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '450px',
            background: 'var(--bg-primary)',
            borderLeft: '1px solid var(--glass-border)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Conversation' : 'Conversación'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {selectedConversation.contact}
              </p>
            </div>
            <button
              onClick={() => setShowConversationPanel(false)}
              style={{
                padding: '8px',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '20px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {language === 'EN' ? 'Purchase Details' : 'Detalles de Compra'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                {selectedConversation.shop_type}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {selectedConversation.goods_bought}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                €{selectedConversation.total_sum}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
                {language === 'EN' ? 'MESSAGE HISTORY (READ-ONLY)' : 'HISTORIAL DE MENSAJES (SOLO LECTURA)'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px', maxWidth: '80%' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {language === 'EN' ? 'Hi! I\'m interested in your service.' : '¡Hola! Estoy interesado en tu servicio.'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      10:30 AM
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', maxWidth: '80%', background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))' }}>
                    <div style={{ fontSize: '13px', color: '#FFFFFF' }}>
                      {language === 'EN' ? 'Great! Let me send you the details.' : '¡Genial! Te envío los detalles.'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
                      10:32 AM
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', maxWidth: '80%', background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))' }}>
                    <div style={{ fontSize: '13px', color: '#FFFFFF' }}>
                      {language === 'EN' ? 'Here\'s your payment link:' : 'Aquí está tu enlace de pago:'}<br />
                      <a href={selectedConversation.payment_link} target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF', textDecoration: 'underline' }}>
                        {selectedConversation.payment_link}
                      </a>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
                      10:33 AM
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px', maxWidth: '80%' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {language === 'EN' ? 'Perfect! Payment completed.' : '¡Perfecto! Pago completado.'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      11:05 AM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
