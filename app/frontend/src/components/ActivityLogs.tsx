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
  WhatsApp: [
    { identifier: '+79859757194', lastMessage: 'Отлично, сколько стоит тур...', lastTimestamp: '2025-11-20T12:46:10', totalMessages: 42 },
    { identifier: '+375295318034', lastMessage: 'Спасибо за информацию!', lastTimestamp: '2025-11-27T14:12:10', totalMessages: 12 }
  ],
  Telegram: [
    { identifier: '@pavel_doomer', lastMessage: 'When can I pick up the car?', lastTimestamp: '2025-11-19T10:30:00', totalMessages: 8 },
    { identifier: '@sunset_traveler', lastMessage: 'Amazing experience!', lastTimestamp: '2025-11-25T16:45:00', totalMessages: 15 }
  ],
  Instagram: [
    { identifier: '@wellness_vibes', lastMessage: 'Thank you for the consultation', lastTimestamp: '2025-11-22T09:00:00', totalMessages: 5 },
    { identifier: '@adventure_club', lastMessage: 'Diving course was great!', lastTimestamp: '2025-11-24T18:20:00', totalMessages: 22 }
  ],
  Facebook: [
    { identifier: 'travelwithlena', lastMessage: 'Yoga retreat booking confirmed', lastTimestamp: '2025-11-18T11:00:00', totalMessages: 10 },
    { identifier: 'peter_travel', lastMessage: 'Wine tasting was excellent', lastTimestamp: '2025-11-21T15:30:00', totalMessages: 7 }
  ],
  Gmail: [
    { identifier: 'client@example.com', lastMessage: 'Surf lesson booking', lastTimestamp: '2025-11-21T10:00:00', totalMessages: 6 },
    { identifier: 'anna.smith@gmail.com', lastMessage: 'Massage appointment', lastTimestamp: '2025-11-20T09:00:00', totalMessages: 4 }
  ],
  TikTok: [
    { identifier: '@oceanlover', lastMessage: 'Kayak tour sounds fun!', lastTimestamp: '2025-11-23T14:00:00', totalMessages: 3 },
    { identifier: '@fitjourney', lastMessage: 'Personal training session booked', lastTimestamp: '2025-11-26T08:30:00', totalMessages: 9 }
  ]
};

const demoConversation: Message[] = [
  { timestamp: '2025-11-20T12:44:48', sender: '+79859757194', text: 'Я люблю кататься на велосипеде и люблю отель четыре звезды чтобы была хорошая эстетика...', type: 'incoming' },
  { timestamp: '2025-11-20T12:45:06', sender: 'Agent', text: 'Для любителей велосипедных прогулок... могу предложить варианты в районе Los Gigantes на острове Tenerife...', type: 'outgoing' },
  { timestamp: '2025-11-20T12:46:10', sender: '+79859757194', text: 'Отлично, сколько стоит тур и как забронировать?', type: 'incoming' },
  { timestamp: '2025-11-20T12:47:03', sender: 'Agent', text: 'Ссылка на оплату: https://buy.stripe.com/test_WA1 — нажмите и оплатите, после пришлю детали.', type: 'outgoing' }
];

const purchaseColumns = {
  WhatsApp: ['id', 'payment_link_id', 'profile_name', 'first_message_sent', 'chat_id', 'instance_id', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Gmail: ['id', 'payment_link_id', 'client_email', 'shop_type', 'purchase_date', 'first_message_sent', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Facebook: ['id', 'payment_link_id', 'chat_id', 'username', 'first_message_sent', 'page_token', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Instagram: ['id', 'payment_link_id', 'chat_id', 'first_message_sent', 'username', 'instagram_token', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  Telegram: ['id', 'payment_link_id', 'chat_id', 'first_message_sent', 'username', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'products_sum', 'delivery_sum', 'goods_bought', 'name', 'recipient_phone_number', 'city', 'delivery_address', 'payment_link_sent_at', 'payment_reminder_hours', 'payment_till', 'payment_received_at', 'payment_link', 'language', 'goods_bought_json', 'TEXT'],
  TikTok: ['id', 'payment_link_id', 'username', 'first_message_sent', 'shop_type', 'purchase_date', 'order_status', 'total_sum', 'goods_bought', 'city', 'payment_link', 'language', 'TEXT']
};

const demoPurchases: Record<string, any[]> = {
  WhatsApp: [
    { payment_link_id: 'plink_WA1', profile_name: 'John Doe', shop_type: 'Boat tour', purchase_date: '2025-11-22T12:30:00', order_status: 'paid', total_sum: 120, goods_bought: 'Private Boat Tour, 2h, 120 EUR', recipient_phone_number: '+351600000000', city: 'Marbella', payment_link_sent_at: '2025-11-22T13:00:00', payment_received_at: '2025-11-22T13:00:00', payment_link: 'https://buy.stripe.com/test_WA1', language: 'English', TEXT: 'https://docs.google.com/document/d/WA1_example/edit?usp=sharing' },
    { payment_link_id: 'plink_WA2', profile_name: 'Alice Summers', shop_type: 'Paragliding', purchase_date: '2025-11-23T09:15:00', order_status: 'completed', total_sum: 180, goods_bought: 'Paragliding flight over Costa del Sol, 180 EUR', payment_link: 'https://buy.stripe.com/test_WA2', TEXT: 'https://docs.google.com/document/d/WA2_example/edit?usp=sharing' }
  ],
  Gmail: [
    { payment_link_id: 'plink_GM1', client_email: 'client@example.com', shop_type: 'Surf Lessons', purchase_date: '2025-11-21T10:00:00', order_status: 'paid', total_sum: 85, goods_bought: 'Surf Lesson for beginners, 2h, 85 EUR', payment_link: 'https://buy.stripe.com/test_GM1', TEXT: 'https://docs.google.com/document/d/GM1_example/edit?usp=sharing' },
    { payment_link_id: 'plink_GM2', client_email: 'anna.smith@gmail.com', shop_type: 'Massage service', purchase_date: '2025-11-20T09:00:00', order_status: 'succeeded', total_sum: 60, goods_bought: 'Relax massage, 1h, 60 EUR', payment_link: 'https://buy.stripe.com/test_GM2', TEXT: 'https://docs.google.com/document/d/GM2_example/edit?usp=sharing' }
  ],
  Facebook: [
    { payment_link_id: 'plink_FB1', username: 'travelwithlena', shop_type: 'Yoga retreat', purchase_date: '2025-11-18', order_status: 'completed', total_sum: 220, payment_link: 'https://buy.stripe.com/test_FB1', TEXT: 'https://docs.google.com/document/d/FB1_example/edit?usp=sharing' },
    { payment_link_id: 'plink_FB2', username: 'peter_travel', shop_type: 'Wine tasting', order_status: 'paid', total_sum: 55, payment_link: 'https://buy.stripe.com/test_FB2', TEXT: 'https://docs.google.com/document/d/FB2_example/edit?usp=sharing' }
  ],
  Instagram: [
    { payment_link_id: 'plink_IG1', username: 'wellness_vibes', shop_type: 'Online Consultation', order_status: 'paid', total_sum: 49, payment_link: 'https://buy.stripe.com/test_IG1', TEXT: 'https://docs.google.com/document/d/IG1_example/edit?usp=sharing' },
    { payment_link_id: 'plink_IG2', username: 'adventure_club', shop_type: 'Diving course', order_status: 'completed', total_sum: 320, payment_link: 'https://buy.stripe.com/test_IG2', TEXT: 'https://docs.google.com/document/d/IG2_example/edit?usp=sharing' }
  ],
  Telegram: [
    { payment_link_id: 'plink_TG1', username: 'pavel_doomer', shop_type: 'Car rental', order_status: 'paid', total_sum: 130, payment_link: 'https://buy.stripe.com/test_TG1', TEXT: 'https://docs.google.com/document/d/TG1_example/edit?usp=sharing' },
    { payment_link_id: 'plink_TG2', username: 'sunset_traveler', shop_type: 'Helicopter tour', order_status: 'completed', total_sum: 490, payment_link: 'https://buy.stripe.com/test_TG2', TEXT: 'https://docs.google.com/document/d/TG2_example/edit?usp=sharing' }
  ],
  TikTok: [
    { id: 9001, payment_link_id: 'plink_TT1', username: '@oceanlover', shop_type: 'Kayak tour', order_status: 'paid', total_sum: 75, city: 'Tenerife', payment_link: 'https://buy.stripe.com/test_TT1', TEXT: 'https://docs.google.com/document/d/TT1_example/edit?usp=sharing' },
    { id: 9002, payment_link_id: 'plink_TT2', username: '@fitjourney', shop_type: 'Personal Training', order_status: 'completed', total_sum: 150, city: 'Barcelona', payment_link: 'https://buy.stripe.com/test_TT2', TEXT: 'https://docs.google.com/document/d/TT2_example/edit?usp=sharing' }
  ]
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
