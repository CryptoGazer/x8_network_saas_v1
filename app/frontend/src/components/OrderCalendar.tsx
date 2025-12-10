import React, { useState, useMemo } from 'react';
import { ArrowLeft, Download, Calendar as CalendarIcon, RefreshCw, Plus, ExternalLink, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, History, Edit3 } from 'lucide-react';
import { SyncAttemptsLog } from './SyncAttemptsLog';

interface OrderCalendarProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface Company {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  status: 'Active' | 'Inactive';
}

interface SyncAttempt {
  timestamp: string;
  outcome: 'ok' | 'error';
  message: string;
  actor: string;
  attempt_id: string;
}

interface OrderEvent {
  order_calendar_id: string;
  source: string;
  source_row_ref: string;
  company_id: string;
  company_name: string;
  order_id: string;
  client_name: string;
  contact: string;
  items_summary: string;
  total_sum: number;
  order_status: string;
  scheduled_datetime: string;
  timezone: string;
  created_at: string;
  created_by: 'auto' | 'manual';
  google_calendar_sync_status: string;
  google_calendar_event_id: string | null;
  synced_to_google_calendar: boolean;
  notes: string;
  sync_attempts_log: SyncAttempt[];
}

type ViewMode = 'month' | 'year' | 'list';
type FilterMode = 'all' | 'auto' | 'manual';

const demoCompanies: Company[] = [];

const demoOrders: OrderEvent[] = [];

export const OrderCalendar: React.FC<OrderCalendarProps> = ({ language, onNavigate }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<OrderEvent | null>(null);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showSyncLog, setShowSyncLog] = useState(false);
  const [syncLogOrder, setSyncLogOrder] = useState<OrderEvent | null>(null);

  const filteredOrders = useMemo(() => {
    let orders = demoOrders;

    if (selectedCompany) {
      orders = orders.filter(o => o.company_id === selectedCompany.id);
    }

    if (filterMode !== 'all') {
      orders = orders.filter(o => o.created_by === filterMode);
    }

    return orders.sort((a, b) =>
      new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime()
    );
  }, [selectedCompany, filterMode]);

  const ordersForSelectedDate = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return filteredOrders.filter(o =>
      o.scheduled_datetime.startsWith(dateStr)
    );
  }, [selectedDate, filteredOrders]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getOrdersForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredOrders.filter(o =>
      o.scheduled_datetime.startsWith(dateStr)
    );
  };

  const getSyncStatusIcon = (status: string, synced: boolean) => {
    if (synced) return <CheckCircle2 size={14} color="var(--success-green)" />;
    if (status.startsWith('error:')) return <XCircle size={14} color="#FF6B6B" />;
    if (status === 'never') return <AlertCircle size={14} color="var(--text-muted)" />;
    return <CheckCircle2 size={14} color="var(--success-green)" />;
  };

  const handleShowSyncLog = (order: OrderEvent) => {
    setSyncLogOrder(order);
    setShowSyncLog(true);
  };

  const handleMarkAsAutoManual = (order: OrderEvent, newType: 'auto' | 'manual') => {
    alert(language === 'EN'
      ? `Marking order ${order.order_id} as ${newType}...`
      : `Marcando orden ${order.order_id} como ${newType === 'auto' ? 'automática' : 'manual'}...`
    );
  };

  const handleSyncToGoogleCalendar = (order: OrderEvent) => {
    alert(language === 'EN'
      ? `Syncing order ${order.order_id} to Google Calendar...`
      : `Sincronizando orden ${order.order_id} a Google Calendar...`
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'order_calendar_id', 'source', 'source_row_ref', 'company_id', 'company_name',
      'order_id', 'client_name', 'contact', 'items_summary', 'total_sum',
      'order_status', 'scheduled_datetime', 'timezone', 'created_at', 'created_by',
      'google_calendar_sync_status', 'google_calendar_event_id', 'synced_to_google_calendar',
      'notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.order_calendar_id,
        order.source,
        order.source_row_ref,
        order.company_id,
        order.company_name,
        order.order_id,
        `"${order.client_name}"`,
        order.contact,
        `"${order.items_summary}"`,
        order.total_sum,
        order.order_status,
        order.scheduled_datetime,
        order.timezone,
        order.created_at,
        order.created_by,
        order.google_calendar_sync_status,
        order.google_calendar_event_id || '',
        order.synced_to_google_calendar,
        `"${order.notes}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_calendar_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    alert(language === 'EN'
      ? 'Refreshing Order Calendar...'
      : 'Actualizando Calendario de Órdenes...');
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(language === 'EN' ? 'en-US' : 'es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(language === 'EN' ? 'en-US' : 'es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const dayNames = language === 'EN'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '12px' }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const ordersOnDay = getOrdersForDate(currentDate);
      const isSelected = selectedDate.toDateString() === currentDate.toDateString();
      const isToday = new Date().toDateString() === currentDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(currentDate)}
          style={{
            padding: '12px',
            background: isSelected ? 'rgba(0, 212, 255, 0.15)' : isToday ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
            border: `1px solid ${isSelected ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            position: 'relative',
            minHeight: '80px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{
            fontSize: '14px',
            fontWeight: isToday ? 700 : 600,
            color: isToday ? 'var(--brand-cyan)' : 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {day}
          </div>
          {ordersOnDay.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
              {ordersOnDay.slice(0, 3).map((order, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: order.created_by === 'auto' ? 'var(--brand-cyan)' : '#FFB84D'
                  }}
                  title={order.items_summary}
                />
              ))}
              {ordersOnDay.length > 3 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  +{ordersOnDay.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentMonth.toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {dayNames.map(name => (
            <div key={name} style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '8px 0'
            }}>
              {name}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'DATE/TIME' : 'FECHA/HORA'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'ORDER ID' : 'ID ORDEN'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'CLIENT' : 'CLIENTE'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'ITEMS' : 'ARTÍCULOS'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'SOURCE' : 'ORIGEN'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'TOTAL' : 'TOTAL'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'SYNC' : 'SINC'}
              </th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'EN' ? 'ACTIONS' : 'ACCIONES'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.order_calendar_id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {formatDateTime(order.scheduled_datetime)}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                  {order.order_id}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  {order.client_name}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '250px' }}>
                  {order.items_summary}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: order.created_by === 'auto' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 184, 77, 0.15)',
                    color: order.created_by === 'auto' ? 'var(--brand-cyan)' : '#FFB84D'
                  }}>
                    {order.created_by === 'auto' ? 'Auto' : 'Manual'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
                  €{order.total_sum}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleShowSyncLog(order)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: order.sync_attempts_log.length > 0 ? 'pointer' : 'default',
                      padding: '6px',
                      borderRadius: '6px',
                      opacity: order.sync_attempts_log.length > 0 ? 1 : 0.5
                    }}
                    title={order.sync_attempts_log.length > 0
                      ? (language === 'EN' ? 'View sync log' : 'Ver registro de sincronización')
                      : (language === 'EN' ? 'No sync attempts' : 'Sin intentos de sincronización')
                    }
                    disabled={order.sync_attempts_log.length === 0}
                  >
                    {getSyncStatusIcon(order.google_calendar_sync_status, order.synced_to_google_calendar)}
                  </button>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderPanel(true);
                      }}
                      style={{
                        padding: '6px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid var(--brand-cyan)',
                        borderRadius: '6px',
                        color: 'var(--brand-cyan)',
                        cursor: 'pointer'
                      }}
                      title={language === 'EN' ? 'View details' : 'Ver detalles'}
                    >
                      <ExternalLink size={14} />
                    </button>
                    {!order.synced_to_google_calendar && (
                      <button
                        onClick={() => handleSyncToGoogleCalendar(order)}
                        style={{
                          padding: '6px',
                          background: 'rgba(46, 213, 115, 0.1)',
                          border: '1px solid var(--success-green)',
                          borderRadius: '6px',
                          color: 'var(--success-green)',
                          cursor: 'pointer'
                        }}
                        title={language === 'EN' ? 'Sync to Google Calendar' : 'Sincronizar con Google Calendar'}
                      >
                        <CalendarIcon size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {language === 'EN' ? 'No orders found' : 'No se encontraron órdenes'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%' }}>
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
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Order Calendar' : 'Calendario de Órdenes'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Calendar of paid orders (products & services) — auto-created from Conversation Center and manual entries'
            : 'Calendario de órdenes pagadas (productos y servicios) — creadas automáticamente desde Centro de Conversaciones y entradas manuales'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '200px' }}>
            <select
              value={selectedCompany?.id || ''}
              onChange={(e) => {
                const company = demoCompanies.find(p => p.id === e.target.value);
                setSelectedCompany(company || null);
              }}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                flex: 1
              }}
            >
              <option value="">{language === 'EN' ? 'All Companies' : 'Todas las Empresas'}</option>
              {demoCompanies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.type})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'month' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${viewMode === 'month' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                borderRadius: '8px',
                color: viewMode === 'month' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {language === 'EN' ? 'Month' : 'Mes'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${viewMode === 'list' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                borderRadius: '8px',
                color: viewMode === 'list' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {language === 'EN' ? 'List' : 'Lista'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                padding: '8px 16px',
                background: filterMode === 'all' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${filterMode === 'all' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                borderRadius: '8px',
                color: filterMode === 'all' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {language === 'EN' ? 'All' : 'Todos'}
            </button>
            <button
              onClick={() => setFilterMode('auto')}
              style={{
                padding: '8px 16px',
                background: filterMode === 'auto' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${filterMode === 'auto' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                borderRadius: '8px',
                color: filterMode === 'auto' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Auto
            </button>
            <button
              onClick={() => setFilterMode('manual')}
              style={{
                padding: '8px 16px',
                background: filterMode === 'manual' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${filterMode === 'manual' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                borderRadius: '8px',
                color: filterMode === 'manual' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Manual
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              {language === 'EN' ? 'Export CSV' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'month' ? '2fr 1fr' : '1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'list' && renderListView()}
        </div>

        {viewMode === 'month' && (
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {selectedDate.toLocaleDateString(language === 'EN' ? 'en-US' : 'es-ES', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>

            {ordersForSelectedDate.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ordersForSelectedDate.map((order) => (
                  <div
                    key={order.order_calendar_id}
                    className="glass-card"
                    style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderPanel(true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Clock size={14} color="var(--brand-cyan)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatTime(order.scheduled_datetime)}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: order.created_by === 'auto' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 184, 77, 0.15)',
                        color: order.created_by === 'auto' ? 'var(--brand-cyan)' : '#FFB84D',
                        marginLeft: 'auto'
                      }}>
                        {order.created_by === 'auto' ? 'Auto' : 'Manual'}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {order.client_name}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {order.items_summary}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                        €{order.total_sum}
                      </span>
                      {getSyncStatusIcon(order.google_calendar_sync_status, order.synced_to_google_calendar)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                {language === 'EN' ? 'No orders scheduled' : 'No hay órdenes programadas'}
              </div>
            )}
          </div>
        )}
      </div>

      {showOrderPanel && selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '500px',
            background: 'var(--bg-primary)',
            borderLeft: '1px solid var(--glass-border)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
            overflowY: 'auto'
          }}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'EN' ? 'Order Details' : 'Detalles de Orden'}
              </h3>
              <button
                onClick={() => setShowOrderPanel(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: selectedOrder.created_by === 'auto' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 184, 77, 0.1)',
              border: `1px solid ${selectedOrder.created_by === 'auto' ? 'var(--brand-cyan)' : '#FFB84D'}`,
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {language === 'EN' ? 'ORDER ID' : 'ID ORDEN'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedOrder.order_id}
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', flex: 1 }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {language === 'EN' ? 'CLIENT' : 'CLIENTE'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {selectedOrder.client_name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {selectedOrder.contact}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {language === 'EN' ? 'SCHEDULED DATE/TIME' : 'FECHA/HORA PROGRAMADA'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                {formatDateTime(selectedOrder.scheduled_datetime)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedOrder.timezone}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {language === 'EN' ? 'ITEMS' : 'ARTÍCULOS'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                {selectedOrder.items_summary}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-green)' }}>
                €{selectedOrder.total_sum}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {language === 'EN' ? 'GOOGLE CALENDAR SYNC' : 'SINCRONIZACIÓN GOOGLE CALENDAR'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {getSyncStatusIcon(selectedOrder.google_calendar_sync_status, selectedOrder.synced_to_google_calendar)}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedOrder.synced_to_google_calendar
                    ? (language === 'EN' ? 'Synced' : 'Sincronizado')
                    : selectedOrder.google_calendar_sync_status.startsWith('error:')
                      ? selectedOrder.google_calendar_sync_status.replace('error:', '')
                      : (language === 'EN' ? 'Not synced' : 'No sincronizado')
                  }
                </span>
              </div>

              {!selectedOrder.synced_to_google_calendar && (
                <button
                  onClick={() => handleSyncToGoogleCalendar(selectedOrder)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CalendarIcon size={16} />
                  {language === 'EN' ? 'Sync to Google Calendar' : 'Sincronizar con Google Calendar'}
                </button>
              )}

              {selectedOrder.synced_to_google_calendar && selectedOrder.google_calendar_event_id && (
                <button
                  onClick={() => window.open(`https://calendar.google.com/calendar/event?eid=${selectedOrder.google_calendar_event_id}`, '_blank')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(46, 213, 115, 0.1)',
                    border: '1px solid var(--success-green)',
                    borderRadius: '8px',
                    color: 'var(--success-green)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <ExternalLink size={16} />
                  {language === 'EN' ? 'Open in Google Calendar' : 'Abrir en Google Calendar'}
                </button>
              )}

              {selectedOrder.sync_attempts_log.length > 0 && (
                <button
                  onClick={() => handleShowSyncLog(selectedOrder)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '1px solid var(--brand-cyan)',
                    borderRadius: '8px',
                    color: 'var(--brand-cyan)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <History size={16} />
                  {language === 'EN' ? 'View Sync Log' : 'Ver Registro de Sincronización'} ({selectedOrder.sync_attempts_log.length})
                </button>
              )}
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {language === 'EN' ? 'ORDER TYPE' : 'TIPO DE ORDEN'}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleMarkAsAutoManual(selectedOrder, 'auto')}
                  disabled={selectedOrder.created_by === 'auto'}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: selectedOrder.created_by === 'auto' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 212, 255, 0.05)',
                    border: `1px solid ${selectedOrder.created_by === 'auto' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
                    borderRadius: '8px',
                    color: selectedOrder.created_by === 'auto' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: selectedOrder.created_by === 'auto' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {selectedOrder.created_by === 'auto' && <CheckCircle2 size={14} />}
                  Auto
                </button>

                <button
                  onClick={() => handleMarkAsAutoManual(selectedOrder, 'manual')}
                  disabled={selectedOrder.created_by === 'manual'}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: selectedOrder.created_by === 'manual' ? 'rgba(255, 184, 77, 0.15)' : 'rgba(255, 184, 77, 0.05)',
                    border: `1px solid ${selectedOrder.created_by === 'manual' ? '#FFB84D' : 'var(--glass-border)'}`,
                    borderRadius: '8px',
                    color: selectedOrder.created_by === 'manual' ? '#FFB84D' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: selectedOrder.created_by === 'manual' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {selectedOrder.created_by === 'manual' && <CheckCircle2 size={14} />}
                  Manual
                </button>
              </div>
            </div>

            {selectedOrder.source_row_ref && (
              <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {language === 'EN' ? 'SOURCE' : 'ORIGEN'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: 'rgba(0, 212, 255, 0.15)',
                    color: 'var(--brand-cyan)'
                  }}>
                    {selectedOrder.source}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {selectedOrder.company_name}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('WINDOW_7')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 184, 77, 0.1)',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                    color: '#FFB84D',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageSquare size={16} />
                  {language === 'EN' ? 'Open Source Conversation' : 'Abrir Conversación Origen'}
                </button>
              </div>
            )}

            {selectedOrder.notes && (
              <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {language === 'EN' ? 'NOTES' : 'NOTAS'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedOrder.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSyncLog && syncLogOrder && (
        <SyncAttemptsLog
          attempts={syncLogOrder.sync_attempts_log}
          language={language}
          onClose={() => {
            setShowSyncLog(false);
            setSyncLogOrder(null);
          }}
        />
      )}
    </div>
  );
};
