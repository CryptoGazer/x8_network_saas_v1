import React, { useState } from 'react';
import { CreditCard, Wallet, CheckCircle, XCircle } from 'lucide-react';

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

export const BillingSubscriptions: React.FC<BillingSubscriptionsProps> = ({ language, onNavigate }) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showManageSubscriptionModal, setShowManageSubscriptionModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const billingHistory: BillingHistoryRow[] = [
    {
      paymentId: 'PAY-001',
      date: '31.10.2025',
      description: 'Stripe charge — Surf Group Lessons',
      project: 'Surf Group Lessons',
      tariff: 'Single',
      amount: '€448.00',
      method: 'Visa ****4242',
      status: 'Paid'
    },
    {
      paymentId: 'PAY-002',
      date: '09.10.2025',
      description: 'Stripe charge — Consulting Services',
      project: 'Consulting Services',
      tariff: 'Growth',
      amount: '€998.00',
      method: 'Card ****1111',
      status: 'Paid'
    }
  ];

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
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)' }}>€1,250.00</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Active Projects' : 'Proyectos Activos'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-green)' }}>2</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Next Billing' : 'Próxima Facturación'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>01.12.2025</div>
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

        {/* 2. Payment Method Management */}
        <div id="payment.method.management" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Payment Method Management' : 'Gestión de Métodos de Pago'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={32} color="var(--brand-cyan)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Visa ****4242</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Next charge:' : 'Próximo cargo:'} 01.12.2025
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCardModal(true)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '6px',
                color: 'var(--brand-cyan)',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {language === 'EN' ? 'Add / Change Card' : 'Agregar / Cambiar Tarjeta'}
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {language === 'EN' ? 'Payments are securely processed through Stripe' : 'Los pagos se procesan de forma segura a través de Stripe'}
          </div>
        </div>

        {/* 3. Profile Information */}
        <div id="profile.information" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Profile Information' : 'Información de Perfil'}
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Account Email' : 'Correo de Cuenta'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>user@example.com</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'Company Name' : 'Nombre de Empresa'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>x8work Agency</div>
            </div>
          </div>
        </div>

        {/* 4. Plans & Subscriptions */}
        <div id="plans.subscriptions" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Plans & Subscriptions' : 'Planes y Suscripciones'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Single</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '8px' }}>€249/mo</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {language === 'EN' ? '+ €199 setup fee' : '+ €199 tarifa de instalación'}
              </div>
              <button
                onClick={() => setShowActivateModal(true)}
                style={{
                  width: '100%',
                  padding: '8px',
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

            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Growth</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '8px' }}>€599/mo</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {language === 'EN' ? '+ €399 setup fee' : '+ €399 tarifa de instalación'}
              </div>
              <button
                onClick={() => setShowActivateModal(true)}
                style={{
                  width: '100%',
                  padding: '8px',
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

            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Enterprise</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '8px' }}>€1,299/mo</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {language === 'EN' ? '+ €799 setup fee' : '+ €799 tarifa de instalación'}
              </div>
              <button
                onClick={() => setShowActivateModal(true)}
                style={{
                  width: '100%',
                  padding: '8px',
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

        {/* 5. Subscriptions Per Project */}
        <div id="subscriptions.per.project" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {language === 'EN' ? 'Subscriptions Per Project' : 'Suscripciones por Proyecto'}
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Surf Group Lessons</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Single - €249/mo</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Renews:' : 'Renueva:'} 01.12.2025
                </span>
                <button
                  onClick={() => setShowManageSubscriptionModal(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'EN' ? 'Manage Subscription' : 'Gestionar Suscripción'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Consulting Services</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Growth - €599/mo</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {language === 'EN' ? 'Renews:' : 'Renueva:'} 10.12.2025
                </span>
                <button
                  onClick={() => setShowManageSubscriptionModal(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'EN' ? 'Manage Subscription' : 'Gestionar Suscripción'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Billing & Payments (History) */}
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                {language === 'EN' ? 'Payment Method' : 'Método de Pago'}
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
                <option>Visa ****4242</option>
              </select>
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

      {/* Card Modal */}
      {showCardModal && (
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
        }} onClick={() => setShowCardModal(false)}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '450px', width: '90%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Add / Change Card' : 'Agregar / Cambiar Tarjeta'}
            </h3>
            <div style={{ marginBottom: '20px', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)' }}>
              <CreditCard size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '13px' }}>Stripe Card Element</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCardModal(false)}
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
                onClick={() => setShowCardModal(false)}
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
                {language === 'EN' ? 'Save Card' : 'Guardar Tarjeta'}
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
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>01.12.2025</div>
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
              <select style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}>
                <option>Surf Group Lessons</option>
                <option>Consulting Services</option>
              </select>
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
    </div>
  );
};
