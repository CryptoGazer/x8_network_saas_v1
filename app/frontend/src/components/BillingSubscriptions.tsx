import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';

interface BillingSubscriptionsProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface BillingHistoryRow {
  paymentId: string;
  date: string;
  description: string;
  project: string;
  tariff: string;
  amount: string;
  method: string;
  status: string;
}

interface SpecialOfferConfig {
  enabled: boolean;
  title: string;
  monthlyPrice: string;
  setupFee: string;
  channelsAllowed: string;
  description: string;
}

export const BillingSubscriptions: React.FC<BillingSubscriptionsProps> = ({ language, onNavigate }) => {
  const { user } = useAuth();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showManageSubscriptionModal, setShowManageSubscriptionModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showSpecialOfferModal, setShowSpecialOfferModal] = useState(false);
  const [isAdmin] = useState(true);

  const [specialOffer, setSpecialOffer] = useState<SpecialOfferConfig>({
    enabled: false,
    title: 'Special Offer',
    monthlyPrice: '€349',
    setupFee: '€149',
    channelsAllowed: '3 channels (WhatsApp, Instagram, Telegram)',
    description: 'Limited time offer with premium features'
  });

  useEffect(() => {
    const saved = localStorage.getItem('specialOffer');
    if (saved) {
      try {
        setSpecialOffer(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load special offer:', e);
      }
    }
  }, []);

  const billingHistory: BillingHistoryRow[] = [];

  const handleActivatePlan = async (planId: string) => {
    try {
      const response = await apiClient.createPaymentLink(planId);
      window.location.href = response.payment_link_url;
    } catch (error) {
      console.error('Failed to create payment link:', error);
      alert(language === 'EN'
        ? 'Failed to create payment link. Please try again or contact support.'
        : 'Error al crear enlace de pago. Inténtelo de nuevo o contacte con soporte.');
    }
  };

  const scrollToBillingHistory = () => {
    const element = document.getElementById('billing.payments.history');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          {language === 'EN' ? 'Billing & Subscriptions' : 'Facturación y Suscripciones'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN' ? 'Manage your plans, payments, and billing information' : 'Gestiona tus planes, pagos e información de facturación'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>

        {/* 1. Account Overview */}
        <div id="account.overview" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Account Overview' : 'Resumen de Cuenta'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Wallet Balance' : 'Saldo de Cartera'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)' }}>€0.00</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Active Projects' : 'Proyectos Activos'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-green)' }}>0</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Next Billing' : 'Próxima Facturación'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>-</div>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => setShowTopUpModal(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Wallet size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              {language === 'EN' ? 'Top Up Wallet' : 'Recargar Cartera'}
            </button>
          </div>
        </div>

        {/* 2. Profile Information */}
        <div id="profile.information" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Profile Information' : 'Información de Perfil'}
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Account Email' : 'Correo de Cuenta'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{user?.email || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Company Name' : 'Nombre de Empresa'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>-</div>
            </div>
          </div>
        </div>

        {/* 4. Plans & Subscriptions */}
        <div id="plans.subscriptions" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'EN' ? 'Plans & Subscriptions' : 'Planes y Suscripciones'}
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowSpecialOfferModal(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(201, 160, 77, 0.15)',
                  border: '1px solid var(--gold-accent)',
                  borderRadius: '6px',
                  color: 'var(--gold-accent)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {language === 'EN' ? 'Manage Special Offer' : 'Gestionar Oferta Especial'}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {specialOffer.enabled && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(201, 160, 77, 0.1), rgba(0, 212, 255, 0.05))',
                borderRadius: '8px',
                border: '2px solid var(--gold-accent)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '16px',
                  padding: '4px 12px',
                  background: 'var(--gold-accent)',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {language === 'EN' ? 'Special' : 'Especial'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', marginTop: '8px' }}>
                  {specialOffer.title}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gold-accent)', marginBottom: '4px' }}>
                  {specialOffer.monthlyPrice} / {language === 'EN' ? 'month' : 'mes'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {language === 'EN' ? 'one-time setup:' : 'configuración única:'} {specialOffer.setupFee}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {specialOffer.channelsAllowed}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                  {specialOffer.description}
                </div>
                <button
                  onClick={() => handleActivatePlan('special')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'var(--gold-accent)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {language === 'EN' ? 'Activate' : 'Activar'}
                </button>
              </div>
            )}

            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Single</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                €249 / {language === 'EN' ? 'month' : 'mes'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {language === 'EN' ? 'one-time setup: €199' : 'configuración única: €199'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {language === 'EN' ? '1 channel (example: WhatsApp)' : '1 canal (ejemplo: WhatsApp)'}
              </div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '20px', listStyle: 'disc' }}>
                <li>{language === 'EN' ? 'Up to 1,000 conversations' : 'Hasta 1,000 conversaciones'}</li>
                <li>{language === 'EN' ? 'Product training' : 'Entrenamiento del producto'}</li>
                <li>{language === 'EN' ? 'Stripe integration' : 'Integración con Stripe'}</li>
                <li>Dashboard</li>
                <li>Connect</li>
              </ul>
              <button
                onClick={() => handleActivatePlan('single')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--brand-cyan)',
                  borderRadius: '6px',
                  color: 'var(--brand-cyan)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {language === 'EN' ? 'Activate' : 'Activar'}
              </button>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Double</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                €399 / {language === 'EN' ? 'month' : 'mes'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {language === 'EN' ? 'one-time setup: €299' : 'configuración única: €299'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {language === 'EN' ? '2 channels (example: WhatsApp + Gmail)' : '2 canales (ejemplo: WhatsApp + Gmail)'}
              </div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '20px', listStyle: 'disc' }}>
                <li>{language === 'EN' ? '1,000 conversations per channel' : '1,000 conversaciones por canal'}</li>
                <li>{language === 'EN' ? 'Media replies' : 'Respuestas multimedia'}</li>
                <li>{language === 'EN' ? 'Payment reminders' : 'Recordatorios de pago'}</li>
                <li>{language === 'EN' ? 'Dashboard & analytics' : 'Dashboard y análisis'}</li>
                <li>Connect</li>
              </ul>
              <button
                onClick={() => handleActivatePlan('double')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--brand-cyan)',
                  borderRadius: '6px',
                  color: 'var(--brand-cyan)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {language === 'EN' ? 'Activate' : 'Activar'}
              </button>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Growth</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                €599 / {language === 'EN' ? 'month' : 'mes'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {language === 'EN' ? 'one-time setup: €399' : 'configuración única: €399'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {language === 'EN' ? '6 channels (all available channels)' : '6 canales (todos los canales disponibles)'}
              </div>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', paddingLeft: '20px', listStyle: 'disc' }}>
                <li>{language === 'EN' ? '6,000 conversations' : '6,000 conversaciones'}</li>
                <li>{language === 'EN' ? 'Full automation suite' : 'Suite completa de automatización'}</li>
                <li>{language === 'EN' ? 'Exports & extended analytics' : 'Exportaciones y análisis extendido'}</li>
                <li>Dashboard</li>
              </ul>
              <button
                onClick={() => handleActivatePlan('growth')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--brand-cyan)',
                  borderRadius: '6px',
                  color: 'var(--brand-cyan)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {language === 'EN' ? 'Activate' : 'Activar'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Subscriptions Per Project */}
        <div id="subscriptions.per.project" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Subscriptions Per Project' : 'Suscripciones por Proyecto'}
          </h2>
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            {language === 'EN' ? 'No active subscriptions yet' : 'No hay suscripciones activas aún'}
          </div>
        </div>

        {/* 5. Billing & Payments (History) */}
        <div id="billing.payments.history" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'EN' ? 'Billing & Payments (History)' : 'Facturación y Pagos (Historial)'}
            </h2>
            <button
              onClick={scrollToBillingHistory}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '6px',
                color: 'var(--brand-cyan)',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {language === 'EN' ? 'View Billing History' : 'Ver Historial'}
            </button>
          </div>

          {billingHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              {language === 'EN' ? 'No billing history yet' : 'No hay historial de facturación aún'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Payment ID' : 'ID de Pago'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Date' : 'Fecha'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Description' : 'Descripción'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Project' : 'Proyecto'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Tariff' : 'Tarifa'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Amount (€)' : 'Monto (€)'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Method' : 'Método'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'EN' ? 'Status' : 'Estado'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {row.paymentId}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.description}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {row.project}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {row.tariff}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                      {row.amount}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {row.method}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: row.status === 'Paid' ? 'rgba(36, 211, 154, 0.1)' : 'rgba(255, 92, 92, 0.1)',
                        color: row.status === 'Paid' ? 'var(--success-green)' : 'var(--danger-red)'
                      }}>
                        {row.status === 'Paid' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {row.status}
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

      {/* Top Up Modal */}
      {showTopUpModal && (
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
        }} onClick={() => setShowTopUpModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Top Up Wallet' : 'Recargar Cartera'}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                {language === 'EN' ? 'Amount' : 'Monto'}
              </label>
              <input
                type="number"
                placeholder={language === 'EN' ? 'Enter amount in €' : 'Ingrese monto en €'}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {language === 'EN' ? 'Payment method setup required' : 'Configuración de método de pago requerida'}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTopUpModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => setShowTopUpModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Confirm' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {showManageSubscriptionModal && (
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
        }} onClick={() => setShowManageSubscriptionModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Manage Subscription' : 'Gestionar Suscripción'}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                {language === 'EN' ? 'Current Plan' : 'Plan Actual'}
              </label>
              <select style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}>
                <option>Single - €249/mo</option>
                <option>Growth - €599/mo</option>
                <option>Enterprise - €1,299/mo</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Next billing date' : 'Próxima fecha de facturación'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>-</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowManageSubscriptionModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => setShowManageSubscriptionModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Save Changes' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {showActivateModal && (
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
        }} onClick={() => setShowActivateModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Activate Plan' : 'Activar Plan'}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                {language === 'EN' ? 'Select Project' : 'Seleccionar Proyecto'}
              </label>
              <div style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}>
                {language === 'EN' ? 'No projects available' : 'No hay proyectos disponibles'}
              </div>
            </div>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Selected Plan' : 'Plan Seleccionado'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>Single - €249/mo</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>+ €199 setup fee</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Activate Plan' : 'Activar Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Offer Admin Modal */}
      {showSpecialOfferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowSpecialOfferModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Manage Special Offer' : 'Gestionar Oferta Especial'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={specialOffer.enabled}
                  onChange={(e) => setSpecialOffer({ ...specialOffer, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {language === 'EN' ? 'Enable Special Offer' : 'Activar Oferta Especial'}
                </span>
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {language === 'EN' ? 'Offer Title' : 'Título de la Oferta'}
              </label>
              <input
                type="text"
                value={specialOffer.title}
                onChange={(e) => setSpecialOffer({ ...specialOffer, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {language === 'EN' ? 'Monthly Price' : 'Precio Mensual'}
                </label>
                <input
                  type="text"
                  value={specialOffer.monthlyPrice}
                  onChange={(e) => setSpecialOffer({ ...specialOffer, monthlyPrice: e.target.value })}
                  placeholder="€349"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {language === 'EN' ? 'Setup Fee' : 'Tarifa de Instalación'}
                </label>
                <input
                  type="text"
                  value={specialOffer.setupFee}
                  onChange={(e) => setSpecialOffer({ ...specialOffer, setupFee: e.target.value })}
                  placeholder="€149"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {language === 'EN' ? 'Channels Allowed' : 'Canales Permitidos'}
              </label>
              <input
                type="text"
                value={specialOffer.channelsAllowed}
                onChange={(e) => setSpecialOffer({ ...specialOffer, channelsAllowed: e.target.value })}
                placeholder="3 channels (WhatsApp, Instagram, Telegram)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {language === 'EN' ? 'Description' : 'Descripción'}
              </label>
              <textarea
                value={specialOffer.description}
                onChange={(e) => setSpecialOffer({ ...specialOffer, description: e.target.value })}
                placeholder="Limited time offer with premium features"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSpecialOfferModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('specialOffer', JSON.stringify(specialOffer));
                  setShowSpecialOfferModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--gold-accent), #d4a854)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Save Changes' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
