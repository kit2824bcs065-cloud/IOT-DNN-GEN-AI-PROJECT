import React from 'react';
import { 
  Sprout, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  RefreshCw, 
  Radio, 
  Cpu, 
  User, 
  Bell 
} from 'lucide-react';

export default function Navbar({ 
  theme, 
  toggleTheme, 
  autoSimulate, 
  setAutoSimulate, 
  triggerTick, 
  isTickLoading, 
  currentReading, 
  user 
}) {
  const isSimulated = currentReading?.is_simulated ?? true;

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669, #10b981)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <Sprout size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.18rem', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-main)' }}>
            SmartAgri <span style={{ color: 'var(--primary-500)', fontWeight: 600 }}>IoT & GenAI</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Crop Yield DNN & Farmer Assistant • Tamil Nadu Agricultural Grid
          </p>
        </div>
      </div>

      {/* Middle Status Indicators & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Hardware / Simulation Mode Pill */}
        <div className={`badge ${isSimulated ? 'badge-amber' : 'badge-emerald'}`} style={{ padding: '6px 14px' }}>
          <Radio size={14} className={isSimulated ? '' : 'animate-pulse-subtle'} />
          <span>{isSimulated ? 'DEMO DATA (SIMULATED)' : 'LIVE HARDWARE (ESP32)'}</span>
        </div>

        {/* Auto-Simulation Ticker Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px 6px',
          gap: '6px'
        }}>
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            title={autoSimulate ? 'Pause automated sensor drift' : 'Start automated sensor drift (every 4s)'}
            style={{
              background: autoSimulate ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: autoSimulate ? 'var(--primary-600)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {autoSimulate ? <Pause size={14} /> : <Play size={14} />}
            <span>{autoSimulate ? 'Auto (4s)' : 'Paused'}</span>
          </button>

          <button
            onClick={triggerTick}
            disabled={isTickLoading}
            title="Step simulation forward manually"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '6px 8px',
              cursor: isTickLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={14} className={isTickLoading ? 'animate-spin-slow' : ''} />
          </button>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#64748b" />}
        </button>

        {/* User Profile Snippet */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '6px 14px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--primary-100)',
            color: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {user?.full_name ? user.full_name[0] : 'K'}
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {user?.full_name || 'Kisan Farmer'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.farm_name || 'Vaanavil Farm'} • ₹ INR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
