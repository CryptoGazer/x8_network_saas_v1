import React from 'react';
import { MessageSquare, Calendar, Globe, DollarSign, CheckCircle2, Clock, Link as LinkIcon } from 'lucide-react';

interface ConversationCardProps {
  conversation: {
    payment_link_id: string;
    contact: string;
    shop_type: string;
    purchase_date?: string;
    conversation_start_date?: string;
    conversation_language?: string;
    order_status: string;
    total_sum: number;
    goods_bought: string;
    origin_channel: string;
    client_type: 'Type1' | 'Type2' | 'Type3';
    synced_to_order_calendar: boolean;
    order_calendar_sync: 'auto' | 'manual';
  };
  language: string;
  onClick: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, language, onClick }) => {
  const getClientTypeInfo = (type: string) => {
    switch (type) {
      case 'Type1':
        return {
          label: language === 'EN' ? 'No Link' : 'Sin Enlace',
          color: '#8b9aaf'
        };
      case 'Type2':
        return {
          label: language === 'EN' ? 'Link Sent' : 'Enlace Enviado',
          color: '#ffc107'
        };
      case 'Type3':
        return {
          label: language === 'EN' ? 'Paid' : 'Pagado',
          color: 'var(--success-green)'
        };
      default:
        return { label: type, color: 'var(--text-muted)' };
    }
  };

  const clientTypeInfo = getClientTypeInfo(conversation.client_type);
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="mobile-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${conversation.contact}`}
    >
      <div className="mobile-card-header">
        <div style={{ flex: 1 }}>
          <div className="mobile-card-title">{conversation.contact}</div>
          <div className="mobile-card-subtitle">{conversation.shop_type}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className="mobile-badge mobile-badge-channel">
            {conversation.origin_channel}
          </span>
          {conversation.conversation_language && (
            <span className="mobile-badge mobile-badge-gold">
              {conversation.conversation_language}
            </span>
          )}
        </div>
      </div>

      <div className="mobile-card-body">
        <div className="mobile-card-row">
          <span className="mobile-card-label">
            <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'EN' ? 'Started' : 'Inicio'}
          </span>
          <span className="mobile-card-value">{formatDate(conversation.conversation_start_date)}</span>
        </div>

        <div className="mobile-card-row">
          <span className="mobile-card-label">
            <DollarSign size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'EN' ? 'Amount' : 'Monto'}
          </span>
          <span className="mobile-card-value" style={{ fontWeight: 700 }}>
            €{conversation.total_sum}
          </span>
        </div>

        <div className="mobile-card-row">
          <span className="mobile-card-label">
            <MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'EN' ? 'Status' : 'Estado'}
          </span>
          <span
            className="mobile-badge"
            style={{
              background: `${clientTypeInfo.color}15`,
              color: clientTypeInfo.color
            }}
          >
            {clientTypeInfo.label}
          </span>
        </div>

        {conversation.synced_to_order_calendar && (
          <div className="mobile-card-row">
            <span className="mobile-card-label">
              <CheckCircle2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {language === 'EN' ? 'Calendar' : 'Calendario'}
            </span>
            <span className="mobile-badge mobile-badge-success">
              {language === 'EN' ? 'Synced' : 'Sincronizado'}
            </span>
          </div>
        )}

        {conversation.order_calendar_sync === 'auto' && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} color="var(--brand-cyan)" />
            <span style={{ fontSize: '11px', color: 'var(--brand-cyan)', fontWeight: 600 }}>
              {language === 'EN' ? 'Auto-sync enabled' : 'Auto-sync activado'}
            </span>
          </div>
        )}
      </div>

      <div className="mobile-card-actions">
        <button
          className="mobile-button mobile-button-primary"
          style={{ flex: 1, fontSize: '13px', padding: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label={language === 'EN' ? 'View conversation' : 'Ver conversación'}
        >
          <MessageSquare size={16} />
          {language === 'EN' ? 'View' : 'Ver'}
        </button>
        <button
          className="mobile-button mobile-button-secondary"
          style={{ flex: 1, fontSize: '13px', padding: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label={language === 'EN' ? 'Copy link' : 'Copiar enlace'}
        >
          <LinkIcon size={16} />
          {language === 'EN' ? 'Copy Link' : 'Copiar'}
        </button>
      </div>
    </div>
  );
};
