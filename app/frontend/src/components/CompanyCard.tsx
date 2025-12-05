import React from 'react';
import { MessageSquare, Mail, Send, Facebook } from 'lucide-react';

export interface Company {
  id: string;
  name: string;
  created: string;
  productType: string;
  channels: string[];
  totalMessages: number;
  type1: number;
  type2: number;
  type2Unpaid: number;
  type3: number;
  type3Paid: number;
  avgResponse: number;
  subscriptionEnds: string;
  status: string;
}

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
  language: string;
}

const ChannelIcon: React.FC<{ channel: string }> = ({ channel }) => {
  const iconStyle = { width: '20px', height: '20px' };

  switch (channel.toLowerCase()) {
    case 'whatsapp':
      return (
        <div style={{ ...iconStyle, color: '#25D366' }}>
          <MessageSquare size={20} fill="currentColor" />
        </div>
      );
    case 'instagram':
      return (
        <div style={{ ...iconStyle, color: '#E4405F' }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      );
    case 'facebook':
      return <Facebook size={20} style={{ color: '#1877F2' }} />;
    case 'gmail':
      return <Mail size={20} style={{ color: '#EA4335' }} />;
    case 'telegram':
      return <Send size={20} style={{ color: '#0088CC' }} />;
    default:
      return <MessageSquare size={20} style={{ color: 'var(--text-muted)' }} />;
  }
};

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick, language }) => {
  const labels = {
    en: { noLinkSent: 'no link sent', unpaid: 'unpaid', paid: 'paid' },
    es: { noLinkSent: 'sin enlace enviado', unpaid: 'sin pagar', paid: 'pagado' }
  };
  const lang = language.toLowerCase() as 'en' | 'es';

  return (
    <div
      className="company-card glass-card"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr 0.8fr 0.8fr 1fr 1fr 0.8fr 1fr 0.8fr',
        gap: '12px',
        padding: '20px 24px',
        cursor: 'pointer',
        alignItems: 'center',
        transition: 'all var(--transition-normal)',
        marginBottom: '12px'
      }}
    >
      <div className="company-name" style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
        {company.name}
      </div>

      <div className="company-id" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600 }}>ID: {company.id}</div>
        <div style={{ fontSize: '11px' }}>{new Date(company.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <div className="company-productType" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
        {company.productType}
      </div>

      <div className="company-channels" style={{ display: 'flex', gap: '8px' }}>
        {company.channels.map((channel, idx) => (
          <ChannelIcon key={idx} channel={channel} />
        ))}
      </div>

      <div className="company-totalMessages" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
        {company.totalMessages.toLocaleString()}
      </div>

      <div className="company.type1.count" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 500 }}>{company.type1.toLocaleString()}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{labels[lang].noLinkSent}</div>
      </div>

      <div className="company.type2.count" style={{ fontSize: '13px' }}>
        <div style={{ fontWeight: 500, color: 'var(--accent-yellow)' }}>{company.type2.toLocaleString()}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{labels[lang].unpaid} €{company.type2Unpaid.toLocaleString()}</div>
      </div>

      <div className="company.type3.count" style={{ fontSize: '13px' }}>
        <div style={{ fontWeight: 500, color: 'var(--success-green)' }}>{company.type3.toLocaleString()}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{labels[lang].paid} €{company.type3Paid.toLocaleString()}</div>
      </div>

      <div className="company.avgResponse" style={{ fontSize: '13px', color: 'var(--brand-teal)', fontWeight: 600 }}>
        {company.avgResponse}s
      </div>

      <div className="company.subscription_ends" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {new Date(company.subscriptionEnds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      <div className="company.status">
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
    </div>
  );
};
