import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, ChevronRight } from 'lucide-react';

interface ActivityLogsProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface ConversationContact {
  identifier: string;
  lastMessage: string;
  lastTimestamp: string;
  totalMessages: number;
}

interface Message {
  timestamp: string;
  sender: string;
  text: string;
  type: 'incoming' | 'outgoing';
}

const demoContacts: Record<string, ConversationContact[]> = {
  WhatsApp: [],
  Telegram: [],
  Instagram: [],
  Facebook: [],
  Gmail: [],
  TikTok: []
};

const demoConversation: Message[] = [];

const purchaseColumns = {
  WhatsApp: ['id', 'payment_link_id', 'profile_name', 'first_message_sent', 'chat_id', 'instance_id', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Gmail: ['id', 'payment_link_id', 'client_email', 'shop_type', 'purchase_date', 'first_message_sent', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Facebook: ['id', 'payment_link_id', 'chat_id', 'username', 'first_message_sent', 'page_token', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Instagram: ['id', 'payment_link_id', 'chat_id', 'first_message_sent', 'username', 'instagram_token', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Telegram: ['id', 'payment_link_id', 'chat_id', 'first_message_sent', 'username', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  TikTok: ['id', 'payment_link_id', 'username', 'first_message_sent', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'goods_bought', 'city', 'payment_link', 'language', 'TEXT']
};

const demoPurchases: Record<string, any[]> = {
  WhatsApp: [],
  Gmail: [],
  Facebook: [],
  Instagram: [],
  Telegram: [],
  TikTok: []
};

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ language, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'purchases'>('conversations');
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [showFullExport, setShowFullExport] = useState(false);
  const [selectedChannelsForExport, setSelectedChannelsForExport] = useState<string[]>(['WhatsApp', 'Telegram', 'Instagram', 'Facebook', 'Gmail', 'TikTok']);

  const channels = ['WhatsApp', 'Telegram', 'Instagram', 'Facebook', 'Gmail', 'TikTok'];

  const handleQuickCopy = () => {
    const text = demoConversation.map(m =>
      `[${m.timestamp}] ${m.sender}: ${m.text}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    alert(language === 'EN' ? 'Conversation copied to clipboard' : 'Conversación copiada al portapapeles');
  };

  const handleDownloadConversationCSV = () => {
    const csv = [
      ['timestamp', 'sender', 'recipient_id', 'message_text', 'message_type', 'channel'],
      ...demoConversation.map(m => [m.timestamp, m.sender, selectedContact || '', m.text, m.type, selectedChannel])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${selectedChannel}_${selectedContact}_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleDownloadPurchasesCSV = () => {
    const cols = purchaseColumns[selectedChannel as keyof typeof purchaseColumns];
    const rows = demoPurchases[selectedChannel];
    const csv = [
      cols,
      ...rows.map(row => cols.map(col => row[col] || ''))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases_${selectedChannel}_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleDownloadFullCSV = () => {
    let allData = 'FULL EXPORT - All Channels\n\n';

    selectedChannelsForExport.forEach(channel => {
      allData += `\n=== ${channel} Purchases ===\n`;
      const cols = purchaseColumns[channel as keyof typeof purchaseColumns];
      const rows = demoPurchases[channel];
      allData += cols.join(',') + '\n';
      rows.forEach(row => {
        allData += cols.map(col => row[col] || '').join(',') + '\n';
      });
    });

    const blob = new Blob([allData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_export_all_channels_${new Date().toISOString()}.csv`;
    a.click();
    setShowFullExport(false);
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
          transition: 'all var(--transition-fast)'
        }}
      >
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Activity Logs' : 'Registros de Actividad'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Logs of conversations and purchases across messaging channels (full history)'
            : 'Registros de conversaciones y compras en canales de mensajería (historial completo)'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('conversations')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'conversations' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'conversations' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeTab === 'conversations' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Conversation Logs' : 'Registros de Conversación'}
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'purchases' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'purchases' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeTab === 'purchases' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Purchases Logs' : 'Registros de Compras'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          {language === 'EN' ? 'SELECT CHANNEL' : 'SELECCIONAR CANAL'}
        </label>
        <select
          value={selectedChannel}
          onChange={(e) => {
            setSelectedChannel(e.target.value);
            setSelectedContact(null);
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
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          {channels.map(ch => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>
      </div>

      {activeTab === 'conversations' && !selectedContact && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Contacts / Identifiers' : 'Contactos / Identificadores'}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {language === 'EN' ? 'Identifier' : 'Identificador'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {language === 'EN' ? 'Last Message' : 'Último Mensaje'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {language === 'EN' ? 'Last Timestamp' : 'Última Marca de Tiempo'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {language === 'EN' ? 'Total Messages' : 'Mensajes Totales'}
                  </th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {demoContacts[selectedChannel]?.map((contact, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                    onClick={() => setSelectedContact(contact.identifier)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', color: 'var(--brand-cyan)', fontWeight: 600 }}>{contact.identifier}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>{contact.lastMessage}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(contact.lastTimestamp).toLocaleString()}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{contact.totalMessages}</td>
                    <td style={{ padding: '12px' }}><ChevronRight size={18} color="var(--text-muted)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'conversations' && selectedContact && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <button
                onClick={() => setSelectedContact(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
              >
                <ArrowLeft size={16} />
                {language === 'EN' ? 'Back to Contacts' : 'Volver a Contactos'}
              </button>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'EN' ? 'Conversation with' : 'Conversación con'} {selectedContact}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleQuickCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--brand-cyan)',
                  borderRadius: '8px',
                  color: 'var(--brand-cyan)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Copy size={16} />
                {language === 'EN' ? 'Quick Copy' : 'Copiar Rápido'}
              </button>
              <button
                onClick={handleDownloadConversationCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
                CSV
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
            {demoConversation.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: msg.type === 'outgoing' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${msg.type === 'outgoing' ? 'var(--brand-cyan)' : 'var(--brand-teal)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: msg.type === 'outgoing' ? 'var(--brand-cyan)' : 'var(--brand-teal)' }}>
                    {msg.sender}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.5' }}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'EN' ? 'Purchases' : 'Compras'} — {selectedChannel}
            </h3>
            <button
              onClick={handleDownloadPurchasesCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              {language === 'EN' ? 'Download CSV' : 'Descargar CSV'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {purchaseColumns[selectedChannel as keyof typeof purchaseColumns]?.slice(0, 10).map((col, idx) => (
                    <th key={idx} style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoPurchases[selectedChannel]?.map((purchase, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {purchaseColumns[selectedChannel as keyof typeof purchaseColumns]?.slice(0, 10).map((col, cidx) => (
                      <td key={cidx} style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>
                        {col === 'payment_link' || col === 'TEXT' ? (
                          <a href={purchase[col]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-cyan)', textDecoration: 'none' }}>
                            Link
                          </a>
                        ) : (
                          purchase[col] || '—'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {language === 'EN'
              ? `Showing first 10 columns. Full export includes all ${purchaseColumns[selectedChannel as keyof typeof purchaseColumns]?.length} columns.`
              : `Mostrando las primeras 10 columnas. La exportación completa incluye todas las ${purchaseColumns[selectedChannel as keyof typeof purchaseColumns]?.length} columnas.`}
          </p>
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <button
          onClick={() => setShowFullExport(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-neon))',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            margin: '0 auto'
          }}
        >
          <Download size={20} />
          {language === 'EN' ? 'Download Full CSV (All Channels)' : 'Descargar CSV Completo (Todos los Canales)'}
        </button>
      </div>

      {showFullExport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '90%', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'Export Options' : 'Opciones de Exportación'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              {language === 'EN' ? 'Select channels to include:' : 'Selecciona canales para incluir:'}
            </p>
            <div style={{ marginBottom: '24px' }}>
              {channels.map(ch => (
                <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedChannelsForExport.includes(ch)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChannelsForExport([...selectedChannelsForExport, ch]);
                      } else {
                        setSelectedChannelsForExport(selectedChannelsForExport.filter(c => c !== ch));
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{ch}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowFullExport(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={handleDownloadFullCSV}
                style={{
                  flex: 1,
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
                {language === 'EN' ? 'Download' : 'Descargar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
