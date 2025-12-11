import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Mic, Smile, Paperclip, Calendar, Clock, Check, User, Bot } from 'lucide-react';

interface SupportPanelProps {
  language: string;
  onNavigate?: (window: string) => void;
  onBadgeUpdate?: (count: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
}

interface DirectMessage {
  id: string;
  sender: 'user' | 'manager';
  content: string;
  timestamp: string;
  read: boolean;
  attachment?: string;
}

interface Meeting {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  seen: boolean;
}

export const SupportPanel: React.FC<SupportPanelProps> = ({ language, onNavigate, onBadgeUpdate }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [meetingReason, setMeetingReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [activeSection, setActiveSection] = useState<'chat' | 'dm' | 'meeting' | null>(null);

  useEffect(() => {
    const storedChat = localStorage.getItem('support_chat');
    if (storedChat) {
      setChatMessages(JSON.parse(storedChat));
    } else {
      const initialChat: ChatMessage[] = [
        {
          id: '1',
          sender: 'ai',
          content: 'Hello! I\'m your AI support assistant. How can I help you today?',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      setChatMessages(initialChat);
      localStorage.setItem('support_chat', JSON.stringify(initialChat));
    }

    const storedDM = localStorage.getItem('direct_messages');
    if (storedDM) {
      setDirectMessages(JSON.parse(storedDM));
    }

    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      setMeetings(JSON.parse(storedMeetings));
    }
  }, []);

  useEffect(() => {
    const unreadChat = chatMessages.filter(m => m.sender === 'ai' && !m.read).length;
    const unreadDM = directMessages.filter(m => m.sender === 'manager' && !m.read).length;
    const unseenMeetings = meetings.filter(m => !m.seen).length;
    const totalBadge = unreadChat + unreadDM + unseenMeetings;

    if (onBadgeUpdate) {
      onBadgeUpdate(totalBadge);
    }
  }, [chatMessages, directMessages, meetings, onBadgeUpdate]);

  useEffect(() => {
    if (activeSection === 'chat') {
      const updatedChat = chatMessages.map(m => ({ ...m, read: true }));
      setChatMessages(updatedChat);
      localStorage.setItem('support_chat', JSON.stringify(updatedChat));
    } else if (activeSection === 'dm') {
      const updatedDM = directMessages.map(m => ({ ...m, read: true }));
      setDirectMessages(updatedDM);
      localStorage.setItem('direct_messages', JSON.stringify(updatedDM));
    } else if (activeSection === 'meeting') {
      const updatedMeetings = meetings.map(m => ({ ...m, seen: true }));
      setMeetings(updatedMeetings);
      localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
    }
  }, [activeSection]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      read: true
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    localStorage.setItem('support_chat', JSON.stringify(updatedMessages));
    setChatInput('');

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: generateAIResponse(chatInput),
        timestamp: new Date().toISOString(),
        read: activeSection === 'chat'
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setChatMessages(finalMessages);
      localStorage.setItem('support_chat', JSON.stringify(finalMessages));
    }, 1000);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('billing') || lowerInput.includes('subscription')) {
      return 'For billing inquiries, you can check your current subscription in the "Billing & Subscriptions" section. Would you like me to guide you there?';
    } else if (lowerInput.includes('integration') || lowerInput.includes('token')) {
      return 'To manage integrations, visit the "Integrations & Tokens" page where you can connect WhatsApp, Facebook, Instagram, Telegram, and more. Need help with a specific channel?';
    } else if (lowerInput.includes('company') || lowerInput.includes('setup')) {
      return 'You can set up and manage your companies in the "Company Setup" section. This includes configuring tariffs, channels, and business details.';
    } else if (lowerInput.includes('knowledge') || lowerInput.includes('kb')) {
      return 'The Knowledge Base allows you to manage articles and documentation for your AI agents. You can create, edit, and organize content there.';
    } else if (lowerInput.includes('analytics') || lowerInput.includes('reports')) {
      return 'Check the "Analytics Dashboard" for detailed insights on conversations, response times, and customer engagement across all channels.';
    } else {
      return 'I\'m here to help! You can ask me about billing, integrations, company setup, knowledge base, or analytics. What would you like to know more about?';
    }
  };

  const handleSendDM = () => {
    if (!dmInput.trim()) return;

    const userDM: DirectMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: dmInput,
      timestamp: new Date().toISOString(),
      read: true
    };

    const updatedDM = [...directMessages, userDM];
    setDirectMessages(updatedDM);
    localStorage.setItem('direct_messages', JSON.stringify(updatedDM));
    setDmInput('');

    setTimeout(() => {
      const managerResponse: DirectMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'manager',
        content: 'Thank you for your message! I\'ll review this and get back to you within 24 hours.',
        timestamp: new Date().toISOString(),
        read: activeSection === 'dm'
      };

      const finalDM = [...updatedDM, managerResponse];
      setDirectMessages(finalDM);
      localStorage.setItem('direct_messages', JSON.stringify(finalDM));
    }, 2000);
  };

  const handleBookMeeting = () => {
    if (!selectedDate || !selectedTime || !meetingReason.trim()) {
      alert(language === 'EN' ? 'Please fill in all fields' : 'Por favor completa todos los campos');
      return;
    }

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      time: selectedTime,
      reason: meetingReason,
      status: 'confirmed',
      seen: activeSection === 'meeting'
    };

    const updatedMeetings = [...meetings, newMeeting];
    setMeetings(updatedMeetings);
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
    setMeetingReason('');
    setSelectedTime('');
  };

  const exportToCalendar = (meeting: Meeting) => {
    const event = {
      title: 'Support Meeting',
      description: meeting.reason,
      start: new Date(meeting.date + 'T' + meeting.time),
      duration: 60
    };
    alert(language === 'EN' ? 'Calendar export feature coming soon!' : '¡Función de exportar calendario próximamente!');
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Support Panel' : 'Panel de Soporte'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Get help through AI chat, message your manager, or schedule a meeting'
            : 'Obtén ayuda a través del chat AI, envía mensajes a tu gerente o agenda una reunión'}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {language === 'EN' ? 'AI Support Chat' : 'Chat de Soporte AI'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {language === 'EN'
                ? 'Ask questions about setup, billing, integrations or analytics'
                : 'Haz preguntas sobre configuración, facturación, integraciones o análisis'}
            </p>
          </div>
          <button
            onClick={() => setActiveSection(activeSection === 'chat' ? null : 'chat')}
            data-nav="SupportChat"
            style={{
              padding: '8px 16px',
              background: activeSection === 'chat' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: activeSection === 'chat' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {activeSection === 'chat'
              ? (language === 'EN' ? 'Close' : 'Cerrar')
              : (language === 'EN' ? 'Open Chat' : 'Abrir Chat')}
          </button>
        </div>

        {activeSection === 'chat' && (
          <div>
            <div style={{
              height: '400px',
              overflowY: 'auto',
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))'
                      : 'var(--bg-primary)',
                    color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                    border: msg.sender === 'ai' ? '1px solid var(--glass-border)' : 'none',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      marginTop: '4px',
                      textAlign: 'right'
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                style={{
                  padding: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={language === 'EN' ? 'Type your message...' : 'Escribe tu mensaje...'}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendChat}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={18} />
                {language === 'EN' ? 'Send' : 'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {language === 'EN' ? 'Message to Personal Manager' : 'Mensaje al Gerente Personal'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {language === 'EN'
                ? 'Send a direct message to your dedicated manager'
                : 'Envía un mensaje directo a tu gerente dedicado'}
            </p>
          </div>
          {directMessages.filter(m => m.sender === 'manager' && !m.read).length > 0 && (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--danger-red)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {directMessages.filter(m => m.sender === 'manager' && !m.read).length}
            </div>
          )}
          <button
            onClick={() => setActiveSection(activeSection === 'dm' ? null : 'dm')}
            data-nav="DirectMessage"
            style={{
              padding: '8px 16px',
              background: activeSection === 'dm' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: activeSection === 'dm' ? '#10b981' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {activeSection === 'dm'
              ? (language === 'EN' ? 'Close' : 'Cerrar')
              : (language === 'EN' ? 'Open Messages' : 'Abrir Mensajes')}
          </button>
        </div>

        {activeSection === 'dm' && (
          <div>
            <div style={{
              height: '400px',
              overflowY: 'auto',
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              {directMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>{language === 'EN' ? 'No messages yet' : 'No hay mensajes aún'}</p>
                </div>
              ) : (
                directMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'var(--bg-primary)',
                      color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                      border: msg.sender === 'manager' ? '1px solid var(--glass-border)' : 'none',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        marginTop: '4px',
                        textAlign: 'right'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                style={{
                  padding: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Paperclip size={20} />
              </button>
              <button
                style={{
                  padding: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                value={dmInput}
                onChange={(e) => setDmInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendDM()}
                placeholder={language === 'EN' ? 'Type your message...' : 'Escribe tu mensaje...'}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendDM}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={18} />
                {language === 'EN' ? 'Send' : 'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {language === 'EN' ? 'Schedule a Meeting' : 'Agendar una Reunión'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {language === 'EN'
                ? 'Book a call with your support manager'
                : 'Reserva una llamada con tu gerente de soporte'}
            </p>
          </div>
          {meetings.filter(m => !m.seen).length > 0 && (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--danger-red)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {meetings.filter(m => !m.seen).length}
            </div>
          )}
          <button
            onClick={() => setActiveSection(activeSection === 'meeting' ? null : 'meeting')}
            data-nav="ScheduleMeeting"
            style={{
              padding: '8px 16px',
              background: activeSection === 'meeting' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: activeSection === 'meeting' ? '#f59e0b' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {activeSection === 'meeting'
              ? (language === 'EN' ? 'Close' : 'Cerrar')
              : (language === 'EN' ? 'Schedule' : 'Agendar')}
          </button>
        </div>

        {activeSection === 'meeting' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {language === 'EN' ? 'Select Date' : 'Seleccionar Fecha'}
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {language === 'EN' ? 'Select Time' : 'Seleccionar Hora'}
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{language === 'EN' ? 'Choose a time...' : 'Elige una hora...'}</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                {language === 'EN' ? 'Reason for Meeting' : 'Motivo de la Reunión'}
              </label>
              <textarea
                value={meetingReason}
                onChange={(e) => setMeetingReason(e.target.value)}
                placeholder={language === 'EN' ? 'Describe the purpose of this meeting...' : 'Describe el propósito de esta reunión...'}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              onClick={handleBookMeeting}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calendar size={18} />
              {language === 'EN' ? 'Book Meeting' : 'Reservar Reunión'}
            </button>

            {meetings.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {language === 'EN' ? 'Upcoming Meetings' : 'Próximas Reuniones'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="glass-card"
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Clock size={18} style={{ color: 'var(--accent-yellow)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                        </span>
                        <div style={{
                          marginLeft: 'auto',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Check size={14} />
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {meeting.reason}
                      </p>
                      <button
                        onClick={() => exportToCalendar(meeting)}
                        style={{
                          padding: '8px 16px',
                          background: 'transparent',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Calendar size={14} />
                        {language === 'EN' ? 'Add to Calendar' : 'Añadir al Calendario'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
