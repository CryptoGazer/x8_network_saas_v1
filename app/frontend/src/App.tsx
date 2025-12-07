import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CompanyCard, Company } from './components/CompanyCard';
import { CompanyPreview } from './components/CompanyPreview';
import { TimeFilter, TimeRange } from './components/TimeFilter';
import { Footer } from './components/Footer';
import { BillingSubscriptions } from './components/BillingSubscriptions';
import { CompanySetup } from './components/CompanySetup';
import { KnowledgeBase } from './components/KnowledgeBase';
import { IntegrationsTokens } from './components/IntegrationsTokens';
import { SupportPanel } from './components/SupportPanel';
import { AuthChoice } from './components/AuthChoice';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { RegisterWith2FA } from './components/RegisterWith2FA';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
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
import { apiClient } from './lib/api';

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

type AuthScreen = 'choice' | 'login' | 'register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('choice');
  const [currentWindow, setCurrentWindow] = useState('WINDOW_0');
  const [timeRange, setTimeRange] = useState<TimeRange>('All');
  const [userName] = useState('User');
  const [language, setLanguage] = useState('EN');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    const authStatus = apiClient.isAuthenticated();
    if (authStatus) {
      setIsAuthenticated(true);
      loadUserData();
    } else {
      setIsAuthenticated(false);
      setCurrentWindow('WINDOW_AUTH');
    }
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoadingUser(true);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      apiClient.clearTokens();
      setIsAuthenticated(false);
      setCurrentWindow('WINDOW_AUTH');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleNavigate = (window: string) => {
    if (window === 'WINDOW_AUTH') {
      apiClient.clearTokens();
      setIsAuthenticated(false);
      setAuthScreen('choice');
    }
    setCurrentWindow(window);
  };

  const handleLogout = () => {
    apiClient.clearTokens();
    setIsAuthenticated(false);
    setAuthScreen('choice');
    setCurrentWindow('WINDOW_AUTH');
  };

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    setCurrentWindow('WINDOW_0');
    await loadUserData();
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleClosePreview = () => {
    setSelectedCompany(null);
  };

  // Show loading while fetching user data after authentication
  if (isLoadingUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Role-based routing for authenticated users with loaded user data
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return (
        <AdminDashboard
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
        />
      );
    }

    if (user.role === 'manager') {
      return (
        <ManagerDashboard
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
        />
      );
    }

    // Client dashboard - continue to main dashboard below
  }

  if (!isAuthenticated || currentWindow === 'WINDOW_AUTH') {
    if (authScreen === 'choice') {
      return (
        <AuthChoice
          onChoose={(choice) => setAuthScreen(choice)}
          language={language}
        />
      );
    }

    if (authScreen === 'login') {
      return (
        <Login
          onSuccess={handleAuthSuccess}
          onBack={() => setAuthScreen('choice')}
          language={language}
        />
      );
    }

    if (authScreen === 'register') {
      return (
        <RegisterWith2FA
          onSuccess={handleAuthSuccess}
          onBack={() => setAuthScreen('choice')}
          language={language}
        />
      );
    }
  }

  if (currentWindow === 'WINDOW_1') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          flex: 1
        }}>
          <BillingSubscriptions language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_2') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          flex: 1
        }}>
          <CompanySetup language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_3') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          flex: 1
        }}>
          <KnowledgeBase language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_5') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          flex: 1
        }}>
          <IntegrationsTokens language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow === 'WINDOW_9') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          flex: 1
        }}>
          <SupportPanel language={language} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentWindow !== 'WINDOW_0') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
        <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />

        <div style={{
          marginLeft: '328px',
          marginTop: '80px',
          padding: '24px',
          flex: 1
        }}>
          <div className="glass-card" style={{
            padding: '48px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              {currentWindow.replace('WINDOW_', 'Window ')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              This window is not yet implemented
            </p>
            <button
              onClick={() => handleNavigate('WINDOW_0')}
              className="glass-card"
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '8px',
                background: 'rgba(0, 212, 255, 0.15)',
                color: 'var(--brand-cyan)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Back to Account Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <Header onNavigate={handleNavigate} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} />
      <Sidebar onNavigate={handleNavigate} currentWindow={currentWindow} language={language} />
      <CompanyPreview company={selectedCompany} onClose={handleClosePreview} language={language} />

      <main
        className="content"
        style={{
          marginLeft: '328px',
          marginTop: '80px',
          marginRight: selectedCompany ? '448px' : '24px',
          padding: '24px',
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          transition: 'margin-right var(--transition-normal)'
        }}
      >
        <div id="greeting" style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '32px',
          color: 'var(--text-primary)'
        }}>
          {language === 'EN' ? 'Welcome' : 'Bienvenido'}, {userName}
        </div>

        <div id="company.list" style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr 0.8fr 0.8fr 1fr 1fr 0.8fr 1fr 0.8fr',
            gap: '12px',
            padding: '16px 24px',
            marginBottom: '12px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
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
            <CompanyCard
              key={idx}
              company={company}
              onClick={() => handleCompanyClick(company)}
              language={language}
            />
          ))}
        </div>

        <TimeFilter selected={timeRange} onChange={setTimeRange} />

        <div
          id="charts.grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}
        >
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
    </div>
  );
}

export default App;
