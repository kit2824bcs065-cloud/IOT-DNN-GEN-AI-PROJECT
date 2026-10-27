import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Languages, 
  Radio, 
  User, 
  Bot, 
  Droplets, 
  Thermometer, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { api } from '../services/api';

const SUGGESTED_QUESTIONS_EN = [
  "Is my soil moisture sufficient?",
  "Does my crop need irrigation?",
  "Explain my current sensor readings.",
  "What does my soil pH indicate?",
  "Explain my crop yield prediction.",
  "Summarize today's field conditions."
];

const SUGGESTED_QUESTIONS_TA = [
  "என் மண் ஈரப்பதம் போதுமானதா?",
  "பயிருக்கு இப்போது தண்ணீர் பாய்ச்ச வேண்டுமா?",
  "இன்றைய சென்சார் அளவீடுகளை விளக்குங்கள்.",
  "மண் pH அளவு என்ன குறிக்கிறது?",
  "பயிர் மகசூல் கணிப்பை விளக்குங்கள்.",
  "இன்றைய வயல் நிலவரத்தை சுருக்கமாக கூறுங்கள்."
];

export default function GenAiAssistantPage({ currentReading, user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' or 'ta'
  const [loading, setLoading] = useState(false);
  const [modelEngine, setModelEngine] = useState('GenAI Demo Engine');
  const messagesEndRef = useRef(null);

  const reading = currentReading || {};

  // Fetch initial chat history
  const loadChatHistory = async () => {
    try {
      const res = await api.genai.getHistory();
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (msgToSend = null) => {
    const text = msgToSend || inputMessage;
    if (!text || !text.trim() || loading) return;

    setInputMessage('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: text,
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.genai.chat(text, language);
      if (res.success && res.data) {
        setModelEngine(res.data.model_engine || 'Demo Engine');
        const botReply = {
          id: Date.now() + 1,
          sender: 'assistant',
          message: res.data.reply,
          language: res.data.language,
          is_demo_response: res.data.is_demo_mode ? 1 : 0,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botReply]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        message: language === 'ta' 
          ? "மன்னிக்கவும், தகவலைப் பெறுவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." 
          : "Sorry, unable to connect to the assistant service. Please check if the backend is running.",
        language: language,
        is_demo_response: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.genai.clear();
      setMessages([{
        id: Date.now(),
        sender: 'assistant',
        message: language === 'ta' 
          ? "வணக்கம்! உரையாடல் அழிக்கப்பட்டது. உங்கள் பயிருக்கு நான் எவ்வாறு உதவ முடியும்?" 
          : "Vanakkam! Conversation cleared. How can I assist your crop monitoring today?",
        language: language,
        is_demo_response: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const currentQuestions = language === 'ta' ? SUGGESTED_QUESTIONS_TA : SUGGESTED_QUESTIONS_EN;

  return (
    <div className="page-wrapper">
      {/* Header with Title and Language Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              GenAI Farmer Assistant
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Context-aware bilingual advisory synthesizing real-time ESP32 IoT telemetry and crop DNN forecasts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '3px'
          }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                background: language === 'en' ? 'var(--primary-600)' : 'transparent',
                color: language === 'en' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                background: language === 'ta' ? 'var(--primary-600)' : 'transparent',
                color: language === 'ta' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          {/* Clear Conversation */}
          <button
            onClick={handleClearChat}
            className="btn btn-secondary btn-sm"
            title="Reset conversation"
          >
            <Trash2 size={14} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: '20px' }}>
        {/* Main Chat Interface */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: 0 }}>
          {/* Chat Window Top Bar */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Active Advisory Engine
              </span>
            </div>

            <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
              {modelEngine}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Bot size={18} />
                    </div>
                  )}

                  <div style={{
                    maxWidth: '80%',
                    background: isUser ? 'var(--primary-600)' : 'var(--bg-surface-elevated)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-sm)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.message}
                    <div style={{
                      fontSize: '0.68rem',
                      color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                      textAlign: 'right',
                      marginTop: '6px'
                    }}>
                      {m.timestamp || ''}
                    </div>
                  </div>

                  {isUser && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {user?.full_name ? user.full_name[0] : 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  color: 'var(--text-muted)',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={16} className="animate-spin-slow" color="#f59e0b" />
                  <span>Synthesizing field conditions & agronomic recommendations...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface-elevated)',
            overflowX: 'auto',
            display: 'flex',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            {currentQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              background: 'var(--bg-surface)'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'ta' ? "உங்கள் வேளாண்மை கேள்வியை இங்கே கேட்கவும்..." : "Ask questions about soil moisture, irrigation, weather, or yield..."}
              className="form-control"
              style={{ borderRadius: '12px' }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '0 20px', borderRadius: '12px' }}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Side: Real-Time Context Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h4 className="card-title" style={{ fontSize: '1rem' }}>
                <Radio size={18} color="var(--primary-600)" />
                <span>Live Telemetry Context Sent to AI</span>
              </h4>
              <span className="badge badge-emerald">FEEDBACK LOOP</span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Every query dynamically forwards the live field telemetry snapshot to ensure hyper-localized advice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Soil Moisture:</span>
                <strong style={{ color: reading.soil_moisture < 30 ? '#ef4444' : '#10b981' }}>{reading.soil_moisture ?? 28.4}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Temperature:</span>
                <strong>{reading.temperature ?? 32.2}°C</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Humidity:</span>
                <strong>{reading.humidity ?? 58.0}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Soil pH:</span>
                <strong>{reading.soil_ph ?? 6.5}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Precipitation:</span>
                <strong>{reading.rain_detected ? 'Rain Detected' : 'Rain Not Detected'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Field:</span>
                <strong>Tomato (Plot 4A, 3.5 Ac)</strong>
              </div>
            </div>
          </div>

          {/* AI Security & Advisory Notice */}
          <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={18} color="var(--primary-600)" />
              <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Agronomic Advisory Notice</h5>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              AI suggestions are provided for demonstration based on IoT thresholds. 
              API credentials remain securely stored on the Python Flask backend and are never exposed to browser client-side scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
