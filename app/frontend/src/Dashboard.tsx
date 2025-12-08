import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileSidebar } from './components/MobileSidebar';
import { MobileHeader, getWindowTitle } from './components/MobileHeader';
import { CompanyCard, Company } from './components/CompanyCard';
import { CompanyPreview } from './components/CompanyPreview';
import { TimeFilter, TimeRange } from './components/TimeFilter';
import { Footer } from './components/Footer';
import { BillingSubscriptions } from './components/BillingSubscriptions';
import { CompanySetup } from './components/CompanySetup';
import { KnowledgeBase } from './components/KnowledgeBase';
import { IntegrationsTokens } from './components/IntegrationsTokens';
import { SupportPanel } from './components/SupportPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ActivityLogs } from './components/ActivityLogs';
import { TrainingStudio } from './components/TrainingStudio';
import { ProfileSettings } from './components/ProfileSettings';
import { ConversationCenter } from './components/ConversationCenter';
import { OrderCalendar } from './components/OrderCalendar';
import {
  RevenueChannelsChart,
  DialogsSentReceivedChart,
  ByChannelChart,
  ClientTypesChart,
  ByCompanyChart,
  AnsweredMissedChart,
  AvgResponseChart,
  ClientTypeBarChart
} from './components/Charts';

const demoCompanies: Company[] = [
  {
    id: 'SURF001',
    name: 'Surf Group Lessons',
    created: '2025-11-01',
    productType: 'Service',
    channels: ['WhatsApp', 'Instagram'],
    totalMessages: 500,
    type1: 350,
    type2: 100,
    type2Unpaid: 3450,
    type3: 50,
    type3Paid: 1420,
    avgResponse: 8,
    subscriptionEnds: '2025-12-01',
    status: 'Active'
  },
  {
    id: 'CONS002',
    name: 'Consulting Services',
    created: '2025-10-10',
    productType: 'Service',
    channels: ['Facebook', 'Instagram', 'Gmail', 'Telegram'],
    totalMessages: 1280,
    type1: 620,
    type2: 360,
    type2Unpaid: 4890,
    type3: 300,
    type3Paid: 6980,
    avgResponse: 9,
    subscriptionEnds: '2025-12-10',
    status: 'Active'
  }
];

function Dashboard() {
  const { logout, user } = useAuth();
  const [currentWindow, setCurrentWindow] = useState('WINDOW_0');
  const [timeRange, setTimeRange] = useState<TimeRange>('All');
  const [language, setLanguage] = useState('EN');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const userName = user?.full_name || 'User';

  const handleNavigate = (window: string) => {
    setCurrentWindow(window);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleClosePreview = () => {
    setSelectedCompany(null);
  };

  if (currentWindow === 'WINDOW_1') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <BillingSubscriptions language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <BillingSubscriptions language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_2') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <CompanySetup language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <CompanySetup language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_3') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <KnowledgeBase language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <KnowledgeBase language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_4') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <AnalyticsDashboard language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <AnalyticsDashboard language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_5') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <IntegrationsTokens language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <IntegrationsTokens language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_7') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <ConversationCenter language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <ConversationCenter language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_13') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <OrderCalendar language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <OrderCalendar language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_9') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <SupportPanel language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <SupportPanel language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_10') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <ActivityLogs language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <ActivityLogs language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_11') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <TrainingStudio language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <TrainingStudio language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_12') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', flex: 1 }} className="desktop-only">
          <ProfileSettings language={language} onNavigate={handleNavigate} />
        </div>
        <div style={{ padding: '16px' }} className="mobile-only">
          <ProfileSettings language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow !== 'WINDOW_0') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
        <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
        <div style={{ marginLeft: '328px', marginTop: '80px', padding: '24px', flex: 1 }}>
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {currentWindow.replace('WINDOW_', 'Window ')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>This window is not yet implemented</p>
            <button onClick={() => handleNavigate('WINDOW_0')} className="glass-card" style={{ marginTop: '24px', padding: '12px 24px', border: '1px solid var(--brand-cyan)', borderRadius: '8px', background: 'rgba(0, 212, 255, 0.15)', color: 'var(--brand-cyan)', cursor: 'pointer', fontWeight: 600 }}>
              Back to Account Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
      <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
      <MobileHeader title={getWindowTitle(currentWindow, language)} onMenuClick={() => setIsMobileSidebarOpen(true)} onUserClick={() => handleNavigate('WINDOW_12')} language={language} onLanguageChange={setLanguage} />
      <BottomNav currentWindow={currentWindow} onNavigate={handleNavigate} language={language} />
      <CompanyPreview company={selectedCompany} onClose={handleClosePreview} language={language} />
      <main className="content desktop-only" style={{ marginLeft: '328px', marginTop: '80px', marginRight: selectedCompany ? '448px' : '24px', padding: '24px', height: 'calc(100vh - 80px)', overflowY: 'auto', transition: 'margin-right var(--transition-normal)' }}>
        <div id="greeting" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', color: 'var(--text-primary)' }}>
          {language === 'EN' ? 'Welcome' : 'Bienvenido'}, {userName}
        </div>
        <div id="company.list" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr 0.8fr 0.8fr 1fr 1fr 0.8fr 1fr 0.8fr', gap: '12px', padding: '16px 24px', marginBottom: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>{language === 'EN' ? 'Company' : 'Empresa'}</div>
            <div>ID</div>
            <div>{language === 'EN' ? 'Type' : 'Tipo'}</div>
            <div>{language === 'EN' ? 'Channels' : 'Canales'}</div>
            <div>{language === 'EN' ? 'Total' : 'Total'}</div>
            <div>{language === 'EN' ? 'No Link' : 'Sin Link'}</div>
            <div>{language === 'EN' ? 'Unpaid' : 'Sin Pagar'}</div>
            <div>{language === 'EN' ? 'Paid' : 'Pagado'}</div>
            <div>{language === 'EN' ? 'Avg' : 'Prom'}</div>
            <div>{language === 'EN' ? 'Sub. Ends' : 'Fin Sub.'}</div>
            <div>{language === 'EN' ? 'Status' : 'Estado'}</div>
          </div>
          {demoCompanies.map((company, idx) => (
            <CompanyCard key={idx} company={company} onClick={() => handleCompanyClick(company)} language={language} />
          ))}
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
        <div id="charts.grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <RevenueChannelsChart />
          <DialogsSentReceivedChart />
          <ByChannelChart />
          <ClientTypesChart />
          <ByCompanyChart />
          <AnsweredMissedChart />
          <AvgResponseChart />
          <ClientTypeBarChart />
        </div>
        <Footer />
      </main>
      <div className="mobile-only" style={{ padding: '16px' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>
          {language === 'EN' ? 'Welcome' : 'Bienvenido'}, {userName}
        </div>
        <div style={{ marginBottom: '24px' }}>
          {demoCompanies.map((company, idx) => (
            <div key={idx} className="mobile-card" onClick={() => handleCompanyClick(company)}>
              <div className="mobile-card-header">
                <div>
                  <div className="mobile-card-title">{company.name}</div>
                  <div className="mobile-card-subtitle">{company.id}</div>
                </div>
                <span className={`mobile-badge mobile-badge-${company.status === 'Active' ? 'success' : 'warning'}`}>
                  {company.status}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">{language === 'EN' ? 'Type' : 'Tipo'}</span>
                  <span className="mobile-card-value">{company.productType}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">{language === 'EN' ? 'Messages' : 'Mensajes'}</span>
                  <span className="mobile-card-value">{company.totalMessages}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">{language === 'EN' ? 'Channels' : 'Canales'}</span>
                  <span className="mobile-card-value">{company.channels.join(', ')}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">{language === 'EN' ? 'Subscription' : 'Suscripción'}</span>
                  <span className="mobile-card-value">{company.subscriptionEnds}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <RevenueChannelsChart />
          <DialogsSentReceivedChart />
          <ByChannelChart />
          <ClientTypesChart />
          <ByCompanyChart />
          <AnsweredMissedChart />
          <AvgResponseChart />
          <ClientTypeBarChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
