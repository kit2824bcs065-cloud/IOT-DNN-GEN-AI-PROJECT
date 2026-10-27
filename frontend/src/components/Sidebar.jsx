import React from 'react';
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  Sparkles,
  Droplets,
  HeartPulse,
  BarChart3,
  Cpu,
  Settings,
  LogOut,
  ChevronRight,
  Cloud
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sensors', label: 'Live Sensor Monitoring', icon: Activity, badge: 'LIVE' },
    { id: 'prediction', label: 'Crop Yield Prediction', icon: BrainCircuit, badge: 'DNN' },
    { id: 'genai', label: 'GenAI Farmer Assistant', icon: Sparkles, badge: 'AI' },
    { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets },
    { id: 'health', label: 'Crop Health', icon: HeartPulse },
    { id: 'reports', label: 'Historical Reports', icon: BarChart3 },
    { id: 'devices', label: 'Device Management', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '270px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0
    }}>
      {/* Top Menu Links */}
      <div style={{ padding: '20px 14px', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: 'var(--text-subtle)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0 12px 12px'
        }}>
          Agricultural Operations
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isActive ? 'var(--primary-600)' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isActive ? 'var(--primary-600)' : 'var(--bg-surface-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Ready Banner & Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{
          background: 'var(--bg-surface-elevated)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            background: 'rgba(2, 132, 199, 0.12)',
            padding: '8px',
            borderRadius: '8px',
            color: '#0284c7'
          }}>
            <Cloud size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
              AWS IoT Core Ready
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Modular MQTT Adapter
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: '#ef4444',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}
        >
          <LogOut size={18} />
          <span>Logout Account</span>
        </button>
      </div>
    </aside>
  );
}
