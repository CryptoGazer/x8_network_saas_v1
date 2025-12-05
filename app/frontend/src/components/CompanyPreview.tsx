import React from 'react';
import { Company } from './CompanyCard';
import { X, Calendar, CreditCard, MessageSquare, Clock } from 'lucide-react';

interface CompanyPreviewProps {
  company: Company | null;
  onClose: () => void;
  language: string;
}

export const CompanyPreview: React.FC<CompanyPreviewProps> = ({ company, onClose, language }) => {
  if (!company) return null;

  const labels = {
    en: {
      companyDetails: 'Company Details',
      subscription: 'Subscription',
      metrics: 'Metrics',
      channels: 'Channels',
      totalMessages: 'Total Messages',
      noLinkSent: 'No Link Sent',
      unpaid: 'Unpaid',
      paid: 'Paid',
      avgResponse: 'Avg Response',
      created: 'Created',
      subscriptionEnds: 'Subscription Ends',
      status: 'Status'
    },
    es: {
      companyDetails: 'Detalles de Empresa',
      subscription: 'Suscripción',
      metrics: 'Métricas',
      channels: 'Canales',
      totalMessages: 'Mensajes Totales',
      noLinkSent: 'Sin Enlace Enviado',
      unpaid: 'Sin Pagar',
      paid: 'Pagado',
      avgResponse: 'Respuesta Promedio',
      created: 'Creado',
      subscriptionEnds: 'Suscripción Termina',
      status: 'Estado'
    }
  };

  const lang = language.toLowerCase() as 'en' | 'es';
  const t = labels[lang];

  return (
    <div
      id="company.preview"
      className="glass-card"
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        width: '400px',
        maxHeight: 'calc(100vh - 104px)',
        overflowY: 'auto',
        padding: '24px',
        zIndex: 45
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t.companyDetails}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {company.name}
        </h3>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          ID: {company.id}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <CreditCard size={20} style={{ color: 'var(--brand-cyan)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.subscription}
          </h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.status}:</span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              background: company.status === 'Active' ? 'rgba(36, 211, 154, 0.15)' : 'rgba(255, 92, 92, 0.15)',
              color: company.status === 'Active' ? 'var(--success-green)' : 'var(--danger-red)'
            }}>
              {company.status}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.subscriptionEnds}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {new Date(company.subscriptionEnds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.created}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {new Date(company.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <MessageSquare size={20} style={{ color: 'var(--brand-cyan)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.channels}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {company.channels.map((channel, idx) => (
            <span
              key={idx}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                background: 'rgba(0, 212, 255, 0.1)',
                color: 'var(--brand-cyan)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {channel}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Calendar size={20} style={{ color: 'var(--brand-cyan)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.metrics}
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t.totalMessages}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {company.totalMessages.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {t.noLinkSent}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {company.type1.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {t.unpaid}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-yellow)' }}>
                {company.type2.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                €{company.type2Unpaid.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {t.paid}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--success-green)' }}>
                {company.type3.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                €{company.type3Paid.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} />
              {t.avgResponse}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--brand-teal)' }}>
              {company.avgResponse}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
