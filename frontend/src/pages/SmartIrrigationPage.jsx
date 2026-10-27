import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Power, 
  Settings, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  RefreshCw,
  AlertTriangle,
  RotateCw,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function SmartIrrigationPage({ 
  currentReading, 
  onTogglePump, 
  isPumpLoading 
}) {
  const reading = currentReading || {};
  const irrigation = reading.irrigation || {};

  const moisture = reading.soil_moisture ?? 28.4;
  const pumpOn = irrigation.pump_status === 'ON';

  const [mode, setMode] = useState(irrigation.mode || 'AUTO');
  const [threshold, setThreshold] = useState(irrigation.moisture_threshold || 30.0);
  const [targetMoisture, setTargetMoisture] = useState(irrigation.target_moisture || 48.0);
  const [historyList, setHistoryList] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadIrrigationLogs = async () => {
    try {
      const res = await api.irrigation.getHistory();
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadIrrigationLogs();
  }, [pumpOn]);

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    setStatusMessage('');
    try {
      const res = await api.irrigation.updateSettings({
        mode,
        moisture_threshold: Number(threshold),
        target_moisture: Number(targetMoisture),
      });
      if (res.success) {
        setStatusMessage('Automation thresholds updated successfully.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      setStatusMessage('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title & Status */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Smart Irrigation & Automated Relay Actuation
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Autonomous soil-moisture feedback loop with manual user override and hardware fail-safe timers.
        </p>
      </div>

      {/* Prominent Simulation Label */}
      <div style={{
        background: 'rgba(2, 132, 199, 0.1)',
        border: '1px solid rgba(2, 132, 199, 0.25)',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cpu size={22} color="#0284c7" />
          <div>
            <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>
              ACTUATOR ARCHITECTURE: SIMULATED RELAY & WATER PUMP
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Controls virtual pump state. For real hardware integration, configure ESP32 GPIO 26 to drive the relay coil.
            </p>
          </div>
        </div>

        <span className="badge badge-blue">
          SAFETY SHUTOFF: 20 MIN MAX
        </span>
      </div>

      {/* Operational Grid: Pump Control Card & Threshold Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px', marginBottom: '28px' }}>
        {/* Pump Control Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">
                <Power size={20} color={pumpOn ? '#10b981' : 'var(--text-muted)'} />
                <span>Water Pump Actuator</span>
              </h3>
              <span className={`badge ${pumpOn ? 'badge-emerald' : 'badge-slate'}`}>
                {pumpOn ? 'PUMP RUNNING' : 'PUMP OFF'}
              </span>
            </div>

            {/* Visual Rotating Pump Indicator */}
            <div style={{
              background: pumpOn ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
              border: `2px solid ${pumpOn ? '#10b981' : 'var(--border-color)'}`,
              borderRadius: '20px',
              padding: '30px 20px',
              textAlign: 'center',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: pumpOn ? 'linear-gradient(135deg, #059669, #10b981)' : 'var(--border-color)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: pumpOn ? '0 0 25px rgba(16, 185, 129, 0.45)' : 'none'
              }}>
                <RotateCw size={44} className={pumpOn ? 'animate-spin-slow' : ''} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {pumpOn ? 'Drip Irrigation Flowing' : 'Pump in Idle Standby'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {pumpOn 
                  ? 'Water discharging at approx. 18 Litres/min across Plot 4A drip laterals.' 
                  : 'Relay de-energized. Solenoid valves closed.'}
              </p>
            </div>

            {/* Current Moisture Status */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '18px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Live Soil Moisture Level</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: moisture < threshold ? '#ef4444' : '#10b981' }}>
                  {moisture}%
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {irrigation.recommendation || 'Soil moisture being continuously checked against setpoint.'}
              </div>
            </div>
          </div>

          {/* Manual Control Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => onTogglePump('ON')}
              disabled={isPumpLoading || pumpOn}
              className="btn btn-primary"
              style={{ padding: '14px', opacity: pumpOn ? 0.6 : 1 }}
            >
              <Power size={18} />
              <span>Pump ON</span>
            </button>

            <button
              onClick={() => onTogglePump('OFF')}
              disabled={isPumpLoading || !pumpOn}
              className="btn btn-danger"
              style={{ padding: '14px', opacity: !pumpOn ? 0.6 : 1 }}
            >
              <Power size={18} />
              <span>Pump OFF</span>
            </button>
          </div>
        </div>

        {/* Automation Configuration Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={20} color="var(--primary-600)" />
              <span>Irrigation Automation Thresholds</span>
            </h3>
            <span className="badge badge-emerald">ACTIVE PROFILE</span>
          </div>

          {statusMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              marginBottom: '16px'
            }}>
              {statusMessage}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="form-group">
            <label className="form-label">Irrigation Operational Mode</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              background: 'var(--bg-surface-elevated)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setMode('AUTO')}
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: mode === 'AUTO' ? 'var(--primary-600)' : 'transparent',
                  color: mode === 'AUTO' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                AUTOMATIC (Sensor-Driven)
              </button>
              <button
                type="button"
                onClick={() => setMode('MANUAL')}
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: mode === 'MANUAL' ? 'var(--primary-600)' : 'transparent',
                  color: mode === 'MANUAL' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                MANUAL (User Override)
              </button>
            </div>
          </div>

          {/* Trigger Threshold Slider */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Low Moisture Activation Trigger
              </label>
              <strong style={{ color: 'var(--primary-600)', fontSize: '1rem' }}>{threshold}%</strong>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              When soil moisture falls below {threshold}%, AUTO mode energizes the drip pump automatically.
            </span>
          </div>

          {/* Target Moisture Cutoff Slider */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Target Moisture Shutoff Cutoff
              </label>
              <strong style={{ color: 'var(--primary-600)', fontSize: '1rem' }}>{targetMoisture}%</strong>
            </div>
            <input
              type="range"
              min="35"
              max="70"
              step="1"
              value={targetMoisture}
              onChange={(e) => setTargetMoisture(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              When soil moisture rises to {targetMoisture}%, AUTO mode shuts off the pump to prevent waterlogging.
            </span>
          </div>

          {/* Save Settings Button */}
          <button
            onClick={handleUpdateSettings}
            disabled={savingSettings}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
          >
            <Settings size={18} />
            <span>{savingSettings ? 'Saving Setpoints...' : 'Apply Automation Settings'}</span>
          </button>
        </div>
      </div>

      {/* Irrigation Logs Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={18} color="var(--primary-600)" />
            <span>Irrigation Event & Relay Activation History</span>
          </h3>
          <span className="badge badge-slate">{historyList.length} LOGGED CYCLES</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Action</th>
                <th style={{ padding: '12px 14px' }}>Mode</th>
                <th style={{ padding: '12px 14px' }}>Trigger Reason</th>
                <th style={{ padding: '12px 14px' }}>Moisture Level</th>
                <th style={{ padding: '12px 14px' }}>Relay Details</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${log.action === 'PUMP_ON' ? 'badge-emerald' : 'badge-slate'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.mode}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>{log.triggered_by}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{log.moisture_level}%</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {log.notes || 'ESP32 Relay Triggered'}
                  </td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No irrigation cycles logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
