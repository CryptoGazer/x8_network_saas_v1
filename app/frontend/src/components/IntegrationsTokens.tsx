import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Plus, Eye, EyeOff, Check, X, AlertCircle, Lock } from 'lucide-react';

interface IntegrationsTokensProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface IntegrationRow {
  table_name: string;
  shop_type: string;
  is_service: boolean;
  table_id: string;
  whatsapp_number: string;
  whatsapp_phone_number: string;
  whatsapp_token: string;
  facebook_page_token: string;
  facebook_page_id: string;
  instagram_user_id: string;
  telegram_username: string;
  telegram_business_token: string;
  agent_email: string;
  telegram_invoices_chat_id: string;
  telegram_invoices_token: string;
  tiktok_user_id: string;
  tiktok_access_token: string;
  google_calendar_enabled: boolean;
  google_calendar_integration_id: string;
  google_calendar_api_token: string;
  google_calendar_refresh_token: string;
  google_calendar_primary_calendar_id: string;
  google_calendar_sync_status: string;
  activate: boolean;
  activation_date: string;
  activation_countdown: string;
  project_link: string;
  tariff_limit: number;
  channel_status: string;
}

interface Project {
  name: string;
  tariff: string;
  channels_allowed: number;
}

interface RegistryEntry {
  project: string;
  channels_connected: string[];
  date_activated: string;
  activation_completed: string;
  number_of_channels: number;
  tariff_used: string;
  who_activated: string;
}

export const IntegrationsTokens: React.FC<IntegrationsTokensProps> = ({ language, onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const [validationModal, setValidationModal] = useState<{ show: boolean; missing: string[] }>({ show: false, missing: [] });

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      const companiesData = JSON.parse(storedCompanies);
      const projectsList: Project[] = companiesData.map((c: any) => ({
        name: c.name,
        tariff: c.tariff || '2 channels',
        channels_allowed: parseInt(c.tariff?.match(/\d+/)?.[0] || '2')
      }));
      setProjects(projectsList);
    }

    const storedRows = localStorage.getItem('integration_rows_v2');
    if (storedRows) {
      setRows(JSON.parse(storedRows));
    } else {
      const sampleRows: IntegrationRow[] = [
        {
          table_name: 'DB Product Hotel',
          shop_type: 'Hotel Canarian',
          is_service: false,
          table_id: '2aecab5ca619805289c8c84c',
          whatsapp_number: '+358468029560',
          whatsapp_phone_number: '796988216841416',
          whatsapp_token: 'EAALZAYPZBnFZAsB...',
          facebook_page_token: 'EAALZAYPZBnFZAsBP7BcA8...',
          facebook_page_id: '900509626474227',
          instagram_user_id: '17841478084433727',
          telegram_username: '@ai_product_hotel',
          telegram_business_token: 'MIpEfdVO2EjHFgAA8hfTqK5VrVc',
          agent_email: 'antonpolfb@gmail.com',
          telegram_invoices_chat_id: '-1003416651172',
          telegram_invoices_token: '8553200600:AAGtu3...',
          tiktok_user_id: '',
          tiktok_access_token: '',
          google_calendar_enabled: false,
          google_calendar_integration_id: '',
          google_calendar_api_token: '',
          google_calendar_refresh_token: '',
          google_calendar_primary_calendar_id: '',
          google_calendar_sync_status: 'never',
          activate: false,
          activation_date: '',
          activation_countdown: '',
          project_link: '',
          tariff_limit: 0,
          channel_status: 'Missing token'
        },
        {
          table_name: 'DB Service AIAgent',
          shop_type: 'Our website',
          is_service: true,
          table_id: '2aecab5ca619803481a351e9',
          whatsapp_number: '+358468028765',
          whatsapp_phone_number: '873855089143036',
          whatsapp_token: 'EAALZAYPZBnFZAsB...',
          facebook_page_token: 'EAALZAYPZBnFZAsBP8xOFb...',
          facebook_page_id: '891149194076826',
          instagram_user_id: '17841478032245209',
          telegram_username: '@ai_service_hotel',
          telegram_business_token: 'ieM3jFx7lF0IBAAAQ71B18JQUXY',
          agent_email: 'flowbillingn8n@gmail.com',
          telegram_invoices_chat_id: '-1003184492789',
          telegram_invoices_token: '8305349968:AAC9s...',
          tiktok_user_id: '',
          tiktok_access_token: '',
          google_calendar_enabled: false,
          google_calendar_integration_id: '',
          google_calendar_api_token: '',
          google_calendar_refresh_token: '',
          google_calendar_primary_calendar_id: '',
          google_calendar_sync_status: 'never',
          activate: false,
          activation_date: '',
          activation_countdown: '',
          project_link: '',
          tariff_limit: 0,
          channel_status: 'Missing token'
        }
      ];
      setRows(sampleRows);
      localStorage.setItem('integration_rows_v2', JSON.stringify(sampleRows));
    }

    const storedRegistry = localStorage.getItem('integration_registry');
    if (storedRegistry) {
      setRegistry(JSON.parse(storedRegistry));
    } else {
      const sampleRegistry: RegistryEntry[] = [
        {
          project: 'Demo Project',
          channels_connected: ['WhatsApp', 'Facebook', 'Instagram', 'Telegram'],
          date_activated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          activation_completed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          number_of_channels: 4,
          tariff_used: '4 channels',
          who_activated: 'demo@example.com'
        }
      ];
      setRegistry(sampleRegistry);
      localStorage.setItem('integration_registry', JSON.stringify(sampleRegistry));
    }
  }, []);

  useEffect(() => {
    if (selectedProject && rows.length > 0) {
      const project = projects.find(p => p.name === selectedProject);
      if (project) {
        const updatedRows = rows.map(row => ({
          ...row,
          tariff_limit: project.channels_allowed,
          channel_status: calculateChannelStatus(row, project.channels_allowed)
        }));
        setRows(updatedRows);
        localStorage.setItem('integration_rows_v2', JSON.stringify(updatedRows));
      }
    }
  }, [selectedProject]);

  const calculateChannelStatus = (row: IntegrationRow, allowedChannels: number): string => {
    const activeChannels = countActiveChannels(row);

    if (activeChannels === 0) return 'Missing token';
    if (activeChannels > allowedChannels) return 'Blocked by tariff';
    if (row.activate) return 'Ready';
    return 'Allowed';
  };

  const countActiveChannels = (row: IntegrationRow): number => {
    let count = 0;
    if (row.whatsapp_token) count++;
    if (row.facebook_page_token) count++;
    if (row.instagram_user_id) count++;
    if (row.telegram_business_token) count++;
    if (row.agent_email) count++;
    if (row.tiktok_access_token) count++;
    return count;
  };

  const toggleTokenVisibility = (rowIndex: number, field: string) => {
    const key = `${rowIndex}-${field}`;
    setRevealedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleActivate = (rowIndex: number) => {
    const row = rows[rowIndex];

    if (!selectedProject) {
      alert(language === 'EN' ? 'Please select a project first' : 'Por favor selecciona un proyecto primero');
      return;
    }

    const project = projects.find(p => p.name === selectedProject);
    if (!project) {
      alert(language === 'EN' ? 'Project not found' : 'Proyecto no encontrado');
      return;
    }

    const activeChannels = countActiveChannels(row);
    const missing: string[] = [];

    if (activeChannels > project.channels_allowed) {
      alert(language === 'EN'
        ? `Your tariff allows only ${project.channels_allowed} channels. You have ${activeChannels} channels configured.`
        : `Tu tarifa permite solo ${project.channels_allowed} canales. Tienes ${activeChannels} canales configurados.`
      );
      return;
    }

    if (activeChannels === 0) {
      missing.push('At least one channel token is required');
    }

    if (missing.length > 0) {
      setValidationModal({ show: true, missing });
      return;
    }

    const now = new Date();
    const countdown72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...row,
      activate: true,
      activation_date: now.toISOString(),
      activation_countdown: countdown72h.toISOString(),
      project_link: selectedProject,
      channel_status: 'Ready'
    };

    setRows(updatedRows);
    localStorage.setItem('integration_rows_v2', JSON.stringify(updatedRows));

    setTimeout(() => {
      moveToRegistry(rowIndex);
    }, 3000);
  };

  const moveToRegistry = (rowIndex: number) => {
    const row = rows[rowIndex];
    const channels: string[] = [];

    if (row.whatsapp_token) channels.push('WhatsApp');
    if (row.facebook_page_token) channels.push('Facebook');
    if (row.instagram_user_id) channels.push('Instagram');
    if (row.telegram_business_token) channels.push('Telegram');
    if (row.agent_email) channels.push('Email');
    if (row.tiktok_access_token) channels.push('TikTok');

    const completionDate = new Date(row.activation_countdown);

    const newEntry: RegistryEntry = {
      project: row.project_link,
      channels_connected: channels,
      date_activated: row.activation_date,
      activation_completed: completionDate.toISOString(),
      number_of_channels: channels.length,
      tariff_used: `${row.tariff_limit} channels`,
      who_activated: row.agent_email
    };

    const updatedRegistry = [...registry, newEntry];
    setRegistry(updatedRegistry);
    localStorage.setItem('integration_registry', JSON.stringify(updatedRegistry));
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          alert(language === 'EN' ? 'CSV imported successfully' : 'CSV importado exitosamente');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    const headers = [
      'table_name', 'shop_type', 'is_service', 'table_id', 'whatsapp_number',
      'whatsapp_phone_number', 'whatsapp_token', 'facebook_page_token', 'facebook_page_id',
      'instagram_user_id', 'telegram_username', 'telegram_business_token', 'agent_email',
      'telegram_invoices_chat_id', 'telegram_invoices_token', 'tiktok_user_id',
      'tiktok_access_token', 'google_calendar_enabled', 'google_calendar_integration_id',
      'google_calendar_api_token', 'google_calendar_refresh_token', 'google_calendar_primary_calendar_id',
      'google_calendar_sync_status', 'activate', 'activation_date', 'activation_countdown',
      'project_link', 'tariff_limit', 'channel_status'
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const value = row[h as keyof IntegrationRow];
        return typeof value === 'boolean' ? value.toString() : value || '';
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAddIntegration = () => {
    const newRow: IntegrationRow = {
      table_name: '',
      shop_type: '',
      is_service: false,
      table_id: `${Date.now()}`,
      whatsapp_number: '',
      whatsapp_phone_number: '',
      whatsapp_token: '',
      facebook_page_token: '',
      facebook_page_id: '',
      instagram_user_id: '',
      telegram_username: '',
      telegram_business_token: '',
      agent_email: '',
      telegram_invoices_chat_id: '',
      telegram_invoices_token: '',
      tiktok_user_id: '',
      tiktok_access_token: '',
      google_calendar_enabled: false,
      google_calendar_integration_id: '',
      google_calendar_api_token: '',
      google_calendar_refresh_token: '',
      google_calendar_primary_calendar_id: '',
      google_calendar_sync_status: 'never',
      activate: false,
      activation_date: '',
      activation_countdown: '',
      project_link: selectedProject,
      tariff_limit: 0,
      channel_status: 'Missing token'
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    localStorage.setItem('integration_rows_v2', JSON.stringify(updatedRows));
  };

  const updateRow = (index: number, field: keyof IntegrationRow, value: any) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
    localStorage.setItem('integration_rows_v2', JSON.stringify(updatedRows));
  };

  const getChannelIcon = (channel: string) => {
    const icons: { [key: string]: string } = {
      'WhatsApp': '💬',
      'Facebook': '📘',
      'Instagram': '📷',
      'Telegram': '✈️',
      'Email': '📧',
      'TikTok': '🎵'
    };
    return icons[channel] || '🔗';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'var(--success-green)';
      case 'Allowed': return 'var(--brand-cyan)';
      case 'Blocked by tariff': return 'var(--danger-red)';
      case 'Missing token': return 'var(--text-muted)';
      default: return 'var(--text-secondary)';
    }
  };

  const isFieldDisabled = (row: IntegrationRow, field: string): boolean => {
    if (row.activate) return true;
    if (!selectedProject) return false;

    const project = projects.find(p => p.name === selectedProject);
    if (!project) return false;

    const activeChannels = countActiveChannels(row);
    if (activeChannels >= project.channels_allowed) {
      const tokenFields = ['whatsapp_token', 'facebook_page_token', 'instagram_user_id',
                           'telegram_business_token', 'tiktok_access_token'];
      if (tokenFields.includes(field)) {
        return !row[field as keyof IntegrationRow];
      }
    }

    return false;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <button
        onClick={() => onNavigate && onNavigate('WINDOW_0')}
        data-nav="Back"
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
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Integrations & Tokens' : 'Integraciones y Tokens'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Connect messaging channels via tokens and manage system integrations'
            : 'Conecta canales de mensajería mediante tokens y gestiona integraciones del sistema'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              {language === 'EN' ? 'SELECT PROJECT' : 'SELECCIONAR PROYECTO'}
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <option value="">{language === 'EN' ? 'Choose a project...' : 'Elige un proyecto...'}</option>
              {projects.map(p => (
                <option key={p.name} value={p.name}>{p.name} ({p.tariff})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button
              onClick={handleImportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '8px',
                color: 'var(--brand-cyan)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Upload size={18} />
              {language === 'EN' ? 'Import CSV' : 'Importar CSV'}
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Download size={18} />
              {language === 'EN' ? 'Export CSV' : 'Exportar CSV'}
            </button>

            <button
              onClick={handleAddIntegration}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Plus size={18} />
              {language === 'EN' ? 'Add Integration' : 'Agregar Integración'}
            </button>
          </div>
        </div>
      </div>

      {!selectedProject && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
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
              ? 'No project selected — table displays example data. Select a project to apply tariff-based locking.'
              : 'Ningún proyecto seleccionado — la tabla muestra datos de ejemplo. Selecciona un proyecto para aplicar el bloqueo basado en tarifa.'}
          </p>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {language === 'EN' ? 'Integration Table' : 'Tabla de Integraciones'}
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>Table Name</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shop Type</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Table ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WA Number</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WA Phone ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WA Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FB Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FB Page ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>IG User ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TG Username</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TG Business Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agent Email</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TG Invoice Chat</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TG Invoice Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TikTok User ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TikTok Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal Enabled</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal Name</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal API Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal Refresh Token</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal Calendar ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GCal Sync Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Test GCal Sync</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Activate</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Activation Date</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Countdown</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tariff Limit</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)', position: 'sticky', left: 0, background: 'var(--bg-primary)', zIndex: 5 }}>
                    <input
                      type="text"
                      value={row.table_name}
                      onChange={(e) => updateRow(idx, 'table_name', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '150px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.shop_type}
                      onChange={(e) => updateRow(idx, 'shop_type', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '120px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={row.is_service}
                      onChange={(e) => updateRow(idx, 'is_service', e.target.checked)}
                      disabled={row.activate}
                      style={{ cursor: row.activate ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>{row.table_id}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.whatsapp_number}
                      onChange={(e) => updateRow(idx, 'whatsapp_number', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '130px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.whatsapp_phone_number}
                      onChange={(e) => updateRow(idx, 'whatsapp_phone_number', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '140px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-whatsapp_token`) ? 'text' : 'password'}
                        value={row.whatsapp_token}
                        onChange={(e) => updateRow(idx, 'whatsapp_token', e.target.value)}
                        disabled={row.activate}
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.whatsapp_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'whatsapp_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-whatsapp_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-facebook_page_token`) ? 'text' : 'password'}
                        value={row.facebook_page_token}
                        onChange={(e) => updateRow(idx, 'facebook_page_token', e.target.value)}
                        disabled={row.activate}
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.facebook_page_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'facebook_page_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-facebook_page_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.facebook_page_id}
                      onChange={(e) => updateRow(idx, 'facebook_page_id', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '130px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.instagram_user_id}
                      onChange={(e) => updateRow(idx, 'instagram_user_id', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '140px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.telegram_username}
                      onChange={(e) => updateRow(idx, 'telegram_username', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '140px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-telegram_business_token`) ? 'text' : 'password'}
                        value={row.telegram_business_token}
                        onChange={(e) => updateRow(idx, 'telegram_business_token', e.target.value)}
                        disabled={row.activate}
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.telegram_business_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'telegram_business_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-telegram_business_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="email"
                      value={row.agent_email}
                      onChange={(e) => updateRow(idx, 'agent_email', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '180px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.telegram_invoices_chat_id}
                      onChange={(e) => updateRow(idx, 'telegram_invoices_chat_id', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '140px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-telegram_invoices_token`) ? 'text' : 'password'}
                        value={row.telegram_invoices_token}
                        onChange={(e) => updateRow(idx, 'telegram_invoices_token', e.target.value)}
                        disabled={row.activate}
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.telegram_invoices_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'telegram_invoices_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-telegram_invoices_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.tiktok_user_id}
                      onChange={(e) => updateRow(idx, 'tiktok_user_id', e.target.value)}
                      disabled={row.activate}
                      style={{
                        width: '130px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-tiktok_access_token`) ? 'text' : 'password'}
                        value={row.tiktok_access_token}
                        onChange={(e) => updateRow(idx, 'tiktok_access_token', e.target.value)}
                        disabled={row.activate}
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.tiktok_access_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'tiktok_access_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-tiktok_access_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={row.google_calendar_enabled}
                      onChange={(e) => updateRow(idx, 'google_calendar_enabled', e.target.checked)}
                      disabled={row.activate}
                      style={{ cursor: row.activate ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.google_calendar_integration_id}
                      onChange={(e) => updateRow(idx, 'google_calendar_integration_id', e.target.value)}
                      disabled={row.activate}
                      placeholder="e.g., Main Calendar"
                      style={{
                        width: '140px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-google_calendar_api_token`) ? 'text' : 'password'}
                        value={row.google_calendar_api_token}
                        onChange={(e) => updateRow(idx, 'google_calendar_api_token', e.target.value)}
                        disabled={row.activate}
                        placeholder="API Token"
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.google_calendar_api_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'google_calendar_api_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-google_calendar_api_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type={revealedTokens.has(`${idx}-google_calendar_refresh_token`) ? 'text' : 'password'}
                        value={row.google_calendar_refresh_token}
                        onChange={(e) => updateRow(idx, 'google_calendar_refresh_token', e.target.value)}
                        disabled={row.activate}
                        placeholder="Refresh Token"
                        style={{
                          width: '140px',
                          padding: '6px 8px',
                          background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      {row.google_calendar_refresh_token && (
                        <button
                          onClick={() => toggleTokenVisibility(idx, 'google_calendar_refresh_token')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)', padding: 0 }}
                        >
                          {revealedTokens.has(`${idx}-google_calendar_refresh_token`) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      type="text"
                      value={row.google_calendar_primary_calendar_id}
                      onChange={(e) => updateRow(idx, 'google_calendar_primary_calendar_id', e.target.value)}
                      disabled={row.activate}
                      placeholder="calendar@gmail.com"
                      style={{
                        width: '160px',
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: row.google_calendar_enabled && row.google_calendar_api_token
                        ? 'rgba(46, 213, 115, 0.15)'
                        : 'rgba(139, 154, 175, 0.15)',
                      color: row.google_calendar_enabled && row.google_calendar_api_token
                        ? 'var(--success-green)'
                        : 'var(--text-muted)',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.google_calendar_enabled && row.google_calendar_api_token ? 'Connected' : row.google_calendar_sync_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(language === 'EN' ? 'Testing Google Calendar sync...' : 'Probando sincronización de Google Calendar...')}
                      disabled={!row.google_calendar_enabled || !row.google_calendar_api_token}
                      style={{
                        padding: '6px 12px',
                        background: row.google_calendar_enabled && row.google_calendar_api_token
                          ? 'rgba(0, 212, 255, 0.1)'
                          : 'var(--bg-secondary)',
                        border: '1px solid var(--brand-cyan)',
                        borderRadius: '6px',
                        color: row.google_calendar_enabled && row.google_calendar_api_token
                          ? 'var(--brand-cyan)'
                          : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: row.google_calendar_enabled && row.google_calendar_api_token ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Test Sync
                    </button>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {row.activate ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Check size={18} style={{ color: 'var(--success-green)' }} />
                        <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActivate(idx)}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {row.activation_date ? new Date(row.activation_date).toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--accent-yellow)', fontSize: '12px', fontWeight: 600 }}>
                    {row.activation_countdown ? '72h' : '-'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <select
                      value={row.project_link}
                      onChange={(e) => updateRow(idx, 'project_link', e.target.value)}
                      disabled={row.activate}
                      style={{
                        padding: '6px 8px',
                        background: row.activate ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        cursor: row.activate ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">Select...</option>
                      {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                    {row.tariff_limit || '-'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: `${getStatusColor(row.channel_status)}20`,
                      color: getStatusColor(row.channel_status),
                      whiteSpace: 'nowrap'
                    }}>
                      {row.channel_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {language === 'EN' ? 'Integration Registry' : 'Registro de Integraciones'}
        </h2>

        {registry.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>{language === 'EN' ? 'No activated integrations yet' : 'No hay integraciones activadas aún'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channels Connected</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date Activated</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Activation Completed</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channels</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tariff Used</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Who Activated</th>
                </tr>
              </thead>
              <tbody>
                {registry.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.project}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {entry.channels_connected.map(ch => (
                          <span key={ch} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                          }}>
                            {getChannelIcon(ch)} {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {new Date(entry.date_activated).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--success-green)', fontSize: '12px', fontWeight: 600 }}>
                      {new Date(entry.activation_completed).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                      {entry.number_of_channels}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{entry.tariff_used}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{entry.who_activated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {validationModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setValidationModal({ show: false, missing: [] })}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <X size={48} style={{ color: 'var(--danger-red)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {language === 'EN' ? 'Validation Failed' : 'Validación Fallida'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {language === 'EN' ? 'The following fields are missing:' : 'Faltan los siguientes campos:'}
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              {validationModal.missing.map((item, idx) => (
                <li key={idx} style={{
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}>
                  • {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setValidationModal({ show: false, missing: [] })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {language === 'EN' ? 'Got it' : 'Entendido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
