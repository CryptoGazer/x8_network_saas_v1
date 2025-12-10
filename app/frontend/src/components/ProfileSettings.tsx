import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileSettingsProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface SessionData {
  device: string;
  location: string;
  lastActive: string;
  status: string;
}

interface LoginData {
  date: string;
  ip: string;
  device: string;
  status: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ language, onNavigate }) => {
  const { changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState({
    notif_billing: true,
    notif_new_leads: true,
    notif_integrations: true,
    notif_reports: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const demoUser = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Owner',
    activeCompany: 'Product Hotel Canarian',
    linkedCompanies: ['Product Hotel Canarian', 'Service AI Agent']
  };

  const demoSubscription = {
    plan: 'Single — €249/mo',
    setupFee: '€199',
    nextBilling: '01.12.2025',
    channels: '1 channel (WhatsApp)',
    features: 'Up to 1,000 conversations'
  };

  const connectedChannels = [
    { name: 'WhatsApp', status: 'active' },
    { name: 'Instagram', status: 'active' },
    { name: 'Telegram', status: 'active' },
    { name: 'Facebook', status: 'inactive' },
    { name: 'Gmail', status: 'active' }
  ];

  const recentLogins: LoginData[] = [
    { date: '2025-12-06 10:30', ip: '192.168.1.1', device: 'Chrome on Windows', status: 'Success' },
    { date: '2025-12-05 14:22', ip: '192.168.1.1', device: 'Safari on iPhone', status: 'Success' },
    { date: '2025-12-04 09:15', ip: '192.168.1.1', device: 'Chrome on Windows', status: 'Success' },
    { date: '2025-12-03 16:45', ip: '10.0.0.5', device: 'Firefox on Mac', status: 'Success' },
    { date: '2025-12-02 11:00', ip: '192.168.1.1', device: 'Chrome on Windows', status: 'Failed' }
  ];

  const activeSessions: SessionData[] = [
    { device: 'Chrome on Windows', location: 'Madrid, Spain', lastActive: '5 minutes ago', status: 'Current' },
    { device: 'Safari on iPhone', location: 'Madrid, Spain', lastActive: '2 hours ago', status: 'Active' },
    { device: 'Firefox on Mac', location: 'Barcelona, Spain', lastActive: '1 day ago', status: 'Active' }
  ];

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(language === 'EN' ? 'All fields are required' : 'Todos los campos son requeridos');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'EN' ? 'New passwords do not match' : 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(language === 'EN' ? 'Password must be at least 8 characters' : 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setPasswordSuccess(language === 'EN' ? 'Password updated successfully' : 'Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(language === 'EN' ? 'Current password is incorrect' : 'La contraseña actual es incorrecta');
    }
  };

  const handleLogoutAll = () => {
    const confirmed = window.confirm(
      language === 'EN'
        ? 'Are you sure you want to log out from all devices? You will need to log in again on this device.'
        : '¿Estás seguro de que quieres cerrar sesión en todos los dispositivos? Necesitarás iniciar sesión nuevamente en este dispositivo.'
    );
    if (confirmed) {
      alert(language === 'EN' ? 'Logged out from all devices' : 'Sesión cerrada en todos los dispositivos');
    }
  };

  const handleSaveNotifications = () => {
    alert(language === 'EN' ? 'Notification preferences saved' : 'Preferencias de notificación guardadas');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    alert(language === 'EN' ? 'Account deletion initiated. This action cannot be undone.' : 'Eliminación de cuenta iniciada. Esta acción no se puede deshacer.');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '820px', margin: '0 auto' }}>
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
          {language === 'EN' ? 'Profile & Settings' : 'Perfil y Configuración'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Manage your account information and preferences'
            : 'Gestiona tu información de cuenta y preferencias'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'profile' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'profile' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeTab === 'profile' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Profile' : 'Perfil'}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'settings' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'settings' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeTab === 'settings' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Settings' : 'Configuración'}
        </button>
      </div>

      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'User Information' : 'Información de Usuario'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'FULL NAME' : 'NOMBRE COMPLETO'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoUser.fullName}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'EMAIL' : 'CORREO ELECTRÓNICO'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoUser.email}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                {language === 'EN' ? 'LINKED COMPANIES' : 'EMPRESAS VINCULADAS'}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {demoUser.linkedCompanies.map((company, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid var(--brand-cyan)',
                      borderRadius: '6px',
                      color: 'var(--brand-cyan)',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Subscription Overview' : 'Resumen de Suscripción'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'CURRENT PLAN' : 'PLAN ACTUAL'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                  {demoSubscription.plan}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'NEXT BILLING DATE' : 'PRÓXIMA FECHA DE FACTURACIÓN'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoSubscription.nextBilling}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'SETUP FEE' : 'TARIFA DE CONFIGURACIÓN'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoSubscription.setupFee}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'CHANNELS' : 'CANALES'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoSubscription.channels}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'FEATURES' : 'CARACTERÍSTICAS'}
                </label>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {demoSubscription.features}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {language === 'EN' ? 'Connected Channels' : 'Canales Conectados'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {connectedChannels.map((channel, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${channel.status === 'active' ? 'var(--success-green)' : 'var(--glass-border)'}`,
                    borderRadius: '8px',
                    minWidth: '140px'
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: channel.status === 'active' ? 'var(--success-green)' : 'var(--text-muted)'
                    }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'Recent Logins (Read-only)' : 'Inicios de Sesión Recientes (Solo lectura)'}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {language === 'EN' ? 'DATE' : 'FECHA'}
                    </th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {language === 'EN' ? 'IP ADDRESS' : 'DIRECCIÓN IP'}
                    </th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {language === 'EN' ? 'DEVICE' : 'DISPOSITIVO'}
                    </th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {language === 'EN' ? 'STATUS' : 'ESTADO'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogins.map((login, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontSize: '13px' }}>{login.date}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>{login.ip}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>{login.device}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: login.status === 'Success' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
                            color: login.status === 'Success' ? 'var(--success-green)' : 'var(--danger-red)'
                          }}
                        >
                          {login.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {language === 'EN' ? 'Change Password' : 'Cambiar Contraseña'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'CURRENT PASSWORD' : 'CONTRASEÑA ACTUAL'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="********"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'NEW PASSWORD' : 'NUEVA CONTRASEÑA'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {language === 'EN' ? 'CONFIRM NEW PASSWORD' : 'CONFIRMAR NUEVA CONTRASEÑA'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div style={{ padding: '12px', background: 'rgba(255, 71, 87, 0.15)', border: '1px solid var(--danger-red)', borderRadius: '8px', color: 'var(--danger-red)', fontSize: '14px' }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{ padding: '12px', background: 'rgba(46, 213, 115, 0.15)', border: '1px solid var(--success-green)', borderRadius: '8px', color: 'var(--success-green)', fontSize: '14px' }}>
                  {passwordSuccess}
                </div>
              )}

              <button
                onClick={handlePasswordChange}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                {language === 'EN' ? 'Update Password' : 'Actualizar Contraseña'}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {language === 'EN' ? 'Notification Preferences' : 'Preferencias de Notificación'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              {language === 'EN'
                ? 'Choose which notifications you want to receive.'
                : 'Elige qué notificaciones deseas recibir.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.notif_billing}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, notif_billing: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--brand-cyan)'
                  }}
                />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    {language === 'EN' ? 'Billing & payment alerts' : 'Alertas de facturación y pagos'}
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.notif_new_leads}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, notif_new_leads: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--brand-cyan)'
                  }}
                />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    {language === 'EN' ? 'New leads & new messages' : 'Nuevos leads y mensajes'}
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.notif_integrations}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, notif_integrations: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--brand-cyan)'
                  }}
                />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    {language === 'EN' ? 'Integration errors and channel failures' : 'Errores de integración y fallos de canal'}
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.notif_reports}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, notif_reports: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--brand-cyan)'
                  }}
                />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                    {language === 'EN' ? 'CSV/PDF export completion' : 'Finalización de exportación CSV/PDF'}
                  </div>
                </div>
              </label>
            </div>
            <button
              onClick={handleSaveNotifications}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              {language === 'EN' ? 'Save Notification Settings' : 'Guardar Configuración de Notificaciones'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
