import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, FileText } from 'lucide-react';
import {
  RevenueChannelsChart,
  DialogsSentReceivedChart,
  ByChannelChart,
  ClientTypesChart,
  ByCompanyChart,
  AnsweredMissedChart,
  AvgResponseChart,
  ClientTypeBarChart
} from './Charts';

interface AnalyticsDashboardProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface CompanyData {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  type: 'Product' | 'Service';
  channels: string[];
  subscriptionEnds?: string;
}

const chartExplanations = {
  en: {
    chart1: 'Shows revenue (EUR) dynamics across the selected period together with number of connected channels. Use it to evaluate correlation between channels growth and revenue.',
    chart2: 'Incoming vs outgoing messages. Helps to see operator activity and workload.',
    chart3: 'Share of messages by channel. Useful for support channel planning and marketing.',
    chart4: 'Client type distribution: Type1 (no link sent), Type2 (link sent — unpaid), Type3 (paid).',
    chart5: 'Per-company share of messages.',
    chart6: 'Answered vs missed messages — SLA / response coverage KPI.',
    chart7: 'Average response time — core quality metric. Target shown as 8s.',
    chart8: 'Absolute comparison across client types, includes unpaid/paid sums.'
  },
  es: {
    chart1: 'Muestra la dinámica de ingresos (EUR) en el período seleccionado junto con el número de canales conectados. Úsalo para evaluar la correlación entre el crecimiento de canales e ingresos.',
    chart2: 'Mensajes entrantes vs salientes. Ayuda a ver la actividad del operador y la carga de trabajo.',
    chart3: 'Proporción de mensajes por canal. Útil para planificar canales de soporte y marketing.',
    chart4: 'Distribución de tipos de cliente: Tipo1 (sin enlace enviado), Tipo2 (enlace enviado — no pagado), Tipo3 (pagado).',
    chart5: 'Proporción de mensajes por empresa.',
    chart6: 'Mensajes respondidos vs perdidos — KPI de cobertura de respuesta / SLA.',
    chart7: 'Tiempo de respuesta promedio — métrica de calidad principal. Objetivo mostrado como 8s.',
    chart8: 'Comparación absoluta entre tipos de cliente, incluye sumas no pagadas/pagadas.'
  }
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ language, onNavigate }) => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [dateFrom, setDateFrom] = useState('2025-11-01');
  const [dateTo, setDateTo] = useState('2025-12-01');
  const [isLoading, setIsLoading] = useState(false);

  const demoCompanies: CompanyData[] = [
    {
      id: 'PROD001',
      name: 'Product Hotel Canarian',
      status: 'Active',
      type: 'Product',
      channels: ['WhatsApp', 'Instagram'],
      subscriptionEnds: '2025-12-01'
    },
    {
      id: 'SERV001',
      name: 'Service AI Agent',
      status: 'Active',
      type: 'Service',
      channels: ['Facebook', 'Instagram', 'Gmail', 'Telegram'],
      subscriptionEnds: '2025-12-10'
    }
  ];

  const demoKPIs = {
    totalMessages: 1780,
    answered: 1691,
    missed: 89,
    avgResponse: '8s',
    totalUnpaid: 8340,
    totalPaid: 8400
  };

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      const companiesData = JSON.parse(storedCompanies);
      const companyList = companiesData.map((c: any) => ({
        id: c.companyId || c.id,
        name: c.name,
        status: c.status || 'Active',
        type: c.productType || 'Service',
        channels: c.channels || [],
        subscriptionEnds: c.subscriptionEnds
      }));
      setCompanies([...demoCompanies, ...companyList]);
    } else {
      setCompanies(demoCompanies);
    }
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Analytics Dashboard Export'],
      ['Company', selectedCompany || 'All Companies'],
      ['Period', `${dateFrom} to ${dateTo}`],
      [''],
      ['KPI', 'Value'],
      ['Total Messages', demoKPIs.totalMessages.toString()],
      ['Answered', demoKPIs.answered.toString()],
      ['Missed', demoKPIs.missed.toString()],
      ['Average Response', demoKPIs.avgResponse],
      ['Total Unpaid (EUR)', demoKPIs.totalUnpaid.toString()],
      ['Total Paid (EUR)', demoKPIs.totalPaid.toString()],
      [''],
      ['Time Series Data'],
      ['Month', 'Revenue (EUR)', 'Channels', 'Received', 'Sent'],
      ['Jan', '1200', '1', '320', '208'],
      ['Feb', '2800', '2', '420', '273'],
      ['Mar', '1000', '1', '520', '338'],
      ['Apr', '3400', '4', '518', '337']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${selectedCompany || 'all'}_${dateFrom}_${dateTo}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    alert(language === 'EN'
      ? 'PDF export would generate a visual report with all charts and explanations. Feature would require server-side PDF generation.'
      : 'La exportación PDF generaría un informe visual con todos los gráficos y explicaciones. La función requeriría generación de PDF del lado del servidor.');
  };

  const setPreset = (preset: string) => {
    const now = new Date();
    let from = new Date(now);

    switch (preset) {
      case '7d':
        from.setDate(now.getDate() - 7);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case 'all':
        from = new Date('2025-01-01');
        break;
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  const selectedCompanyData = companies.find(c => c.name === selectedCompany);
  const explanations = language === 'ES' ? chartExplanations.es : chartExplanations.en;

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <button
        onClick={() => onNavigate && onNavigate('WINDOW_0')}
        data-nav="Back"
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
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Analytics Dashboard' : 'Panel de Analíticas'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Company-level analytics with custom time periods'
            : 'Analíticas a nivel de empresa con períodos de tiempo personalizados'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              {language === 'EN' ? 'SELECT COMPANY / PROJECT' : 'SELECCIONAR EMPRESA / PROYECTO'}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <option value="">{language === 'EN' ? 'All Companies (Demo Data)' : 'Todas las Empresas (Datos Demo)'}</option>
              {companies.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} — {c.id} ({c.type}, {c.status})
                </option>
              ))}
            </select>
            {selectedCompanyData && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: selectedCompanyData.status === 'Active' ? 'rgba(36, 211, 154, 0.15)' : 'rgba(181, 181, 195, 0.15)',
                  color: selectedCompanyData.status === 'Active' ? 'var(--success-green)' : 'var(--text-muted)'
                }}>
                  {selectedCompanyData.status}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: 'var(--brand-cyan)'
                }}>
                  {selectedCompanyData.type}
                </span>
                {selectedCompanyData.subscriptionEnds && (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: 'rgba(255, 209, 102, 0.15)',
                    color: 'var(--accent-yellow)'
                  }}>
                    {language === 'EN' ? 'Ends' : 'Termina'}: {selectedCompanyData.subscriptionEnds}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              {language === 'EN' ? 'FROM DATE' : 'FECHA DESDE'}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              {language === 'EN' ? 'TO DATE' : 'FECHA HASTA'}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPreset('7d')}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              7d
            </button>
            <button
              onClick={() => setPreset('30d')}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              30d
            </button>
            <button
              onClick={() => setPreset('all')}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {language === 'EN' ? 'All' : 'Todo'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              <RefreshCw size={18} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              {language === 'EN' ? 'Refresh' : 'Actualizar'}
            </button>

            <button
              onClick={handleExportCSV}
              className="export-csv"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '8px',
                color: 'var(--brand-cyan)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label="Export CSV"
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="export-pdf"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label="Export PDF"
            >
              <FileText size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
            {language === 'EN' ? 'Total Messages' : 'Mensajes Totales'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--brand-cyan)' }}>
            {demoKPIs.totalMessages.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
            {language === 'EN' ? 'Answered / Missed' : 'Respondidos / Perdidos'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success-green)' }}>
              {demoKPIs.answered}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger-red)' }}>
              {demoKPIs.missed}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Math.round((demoKPIs.answered / demoKPIs.totalMessages) * 100)}% / {Math.round((demoKPIs.missed / demoKPIs.totalMessages) * 100)}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
            {language === 'EN' ? 'Avg Response Time' : 'Tiempo Respuesta Prom'}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--brand-teal)' }}>
            {demoKPIs.avgResponse}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-yellow)', marginTop: '4px' }}>
            {language === 'EN' ? 'Target: 10s' : 'Objetivo: 10s'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
            {language === 'EN' ? 'Unpaid / Paid (EUR)' : 'Sin Pagar / Pagado (EUR)'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
              €{demoKPIs.totalUnpaid.toLocaleString()}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-green)' }}>
              €{demoKPIs.totalPaid.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {!selectedCompany && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--text-primary)'
        }}>
          {language === 'EN'
            ? 'No company selected — displaying demo data. Select a company to view specific analytics.'
            : 'Ninguna empresa seleccionada — mostrando datos demo. Selecciona una empresa para ver analíticas específicas.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div>
          <RevenueChannelsChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart1}
          </p>
        </div>

        <div>
          <DialogsSentReceivedChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart2}
          </p>
        </div>

        <div>
          <ByChannelChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart3}
          </p>
        </div>

        <div>
          <ClientTypesChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart4}
          </p>
        </div>

        <div>
          <ByCompanyChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart5}
          </p>
        </div>

        <div>
          <AnsweredMissedChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart6}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div>
          <AvgResponseChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart7}
          </p>
        </div>

        <div>
          <ClientTypeBarChart />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {explanations.chart8}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
