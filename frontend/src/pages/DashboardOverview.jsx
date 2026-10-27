import React from 'react';
import { 
  Droplets, 
  Thermometer, 
  Sun, 
  CloudRain, 
  FlaskConical, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Power, 
  Clock, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert,
  Sprout
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardOverview({ 
  currentReading, 
  historyData, 
  onNavigate, 
  onTogglePump, 
  isPumpLoading 
}) {
  const reading = currentReading || {};
  const health = reading.health_analysis || {};
  const irrigation = reading.irrigation || {};

  const moisture = reading.soil_moisture ?? 28.4;
  const temp = reading.temperature ?? 32.2;
  const humidity = reading.humidity ?? 58.0;
  const ph = reading.soil_ph ?? 6.5;
  const light = reading.light_lux ?? 42500;
  const rain = reading.rain_detected ?? 0;
  const pumpOn = irrigation.pump_status === 'ON';

  // Format chart time stamps
  const chartData = (historyData || []).slice(-16).map(item => ({
    time: item.recorded_at ? item.recorded_at.split(' ')[1].substring(0, 5) : '',
    moisture: item.soil_moisture,
    temp: item.temperature,
    humidity: item.humidity,
  }));

  return (
    <div className="page-wrapper">
      {/* Top Banner: Farm & Crop Status */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(2, 132, 199, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
          }}>
            <Sprout size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Plot 4A: Tomato Field (Polyhouse & Drip)
              </h2>
              <span className="badge badge-emerald">Fruit Formation Stage</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Vaanavil Organic Farms • Pollachi, Coimbatore • 3.5 Acres • Red Sandy Loam (pH 6.5)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Est. Production Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              ₹8,51,400 <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>(47.3 Tonnes)</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('prediction')} 
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
          >
            <span>Run Yield DNN</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 6 Core Sensor Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
        {/* 1. Soil Moisture */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Soil Moisture Sensor
            </span>
            <div style={{
              background: moisture < 30 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: moisture < 30 ? '#ef4444' : '#10b981',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <Droplets size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {moisture}%
            </span>
            <span className={`badge ${moisture < 25 ? 'badge-red' : moisture < 32 ? 'badge-amber' : 'badge-emerald'}`}>
              {health.moisture?.level || 'MONITORED'}
            </span>
          </div>

          {/* Moisture Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{
              width: `${Math.min(100, moisture)}%`,
              height: '100%',
              background: moisture < 30 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #059669)',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }} />
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Target: 35–48% • {health.moisture?.message || 'Monitoring root zone.'}
          </p>
        </div>

        {/* 2. Ambient Temperature */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DHT22 Temperature
            </span>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: '8px', borderRadius: '10px' }}>
              <Thermometer size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {temp}°C
            </span>
            <span className={`badge ${temp > 35 ? 'badge-red' : temp > 32 ? 'badge-amber' : 'badge-emerald'}`}>
              {health.temperature?.level || 'NORMAL'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            Optimum: 22–30°C • {health.temperature?.message || 'Stable canopy temperature.'}
          </p>
        </div>

        {/* 3. Relative Humidity */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DHT22 Humidity
            </span>
            <div style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {humidity}%
            </span>
            <span className={`badge ${humidity > 80 ? 'badge-amber' : 'badge-emerald'}`}>
              {health.humidity?.level || 'OPTIMAL'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            Optimum: 55–75% • {health.humidity?.message || 'Favorable transpirational rate.'}
          </p>
        </div>

        {/* 4. Soil pH */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Soil pH Sensor
            </span>
            <div style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', padding: '8px', borderRadius: '10px' }}>
              <FlaskConical size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {ph}
            </span>
            <span className="badge badge-emerald">NEAR NEUTRAL</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            Target: 6.0–7.0 • Optimum for nitrogen and calcium absorption.
          </p>
        </div>

        {/* 5. Light Intensity */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              LDR Light Sensor
            </span>
            <div style={{ background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', padding: '8px', borderRadius: '10px' }}>
              <Sun size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {Number(light).toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>lux</span>
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            Solar photon flux suitable for photosynthetic saturation.
          </p>
        </div>

        {/* 6. Rain Detector */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Rain Sensor
            </span>
            <div style={{
              background: rain ? 'rgba(2, 132, 199, 0.18)' : 'rgba(100, 116, 139, 0.12)',
              color: rain ? '#0284c7' : 'var(--text-muted)',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <CloudRain size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: rain ? '#0284c7' : 'var(--text-main)' }}>
              {rain === 1 ? 'Rain Detected' : 'Rain Not Detected'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            {rain === 1 ? 'Precipitation confirmed. Drip pump held in standby.' : 'Dry canopy. Standard irrigation scheduled.'}
          </p>
        </div>
      </div>

      {/* Middle Grid: Live Trend Chart & Quick Irrigation Action */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Activity size={20} color="var(--primary-600)" />
                <span>Micro-Climate Telemetry Trend (Past 24 Hours)</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Soil Moisture (%) vs Ambient Temperature (°C)
              </p>
            </div>
            <span className="badge badge-slate">HOURLY RESOLUTION</span>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-surface)', 
                    borderColor: 'var(--border-color)', 
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)'
                  }} 
                />
                <Area type="monotone" dataKey="moisture" name="Soil Moisture (%)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#moistureGrad)" />
                <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Irrigation Action Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <h3 className="card-title">
                <Droplets size={20} color="#0284c7" />
                <span>Smart Irrigation Status</span>
              </h3>
              <span className={`badge ${pumpOn ? 'badge-emerald' : 'badge-slate'}`}>
                {pumpOn ? 'PUMP RUNNING' : 'PUMP OFF'}
              </span>
            </div>

            <div style={{
              background: pumpOn ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${pumpOn ? '#10b981' : 'var(--border-color)'}`,
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: pumpOn ? '#10b981' : 'var(--border-color)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: pumpOn ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
              }}>
                <Power size={32} className={pumpOn ? 'animate-spin-slow' : ''} />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {pumpOn ? 'Relay Active (GPIO 26 LOW)' : 'Relay Standby (GPIO 26 HIGH)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Mode: {irrigation.mode || 'AUTO'} • Trigger threshold: {irrigation.moisture_threshold || 30}%
              </div>
            </div>

            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              background: 'var(--bg-surface-elevated)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <strong>Recommendation:</strong> {irrigation.recommendation || 'Soil conditions optimal.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onTogglePump(pumpOn ? 'OFF' : 'ON')}
              disabled={isPumpLoading}
              className={`btn ${pumpOn ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1, padding: '12px' }}
            >
              <Power size={18} />
              <span>{pumpOn ? 'Turn Pump OFF' : 'Turn Pump ON (Manual)'}</span>
            </button>
            <button
              onClick={() => onNavigate('irrigation')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0 14px' }}
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Alerts & Last Update Footer */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Last Telemetry Cycle: <strong>{reading.last_updated || 'Just now'}</strong>
          </span>
          <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
            DEVICE ID: {reading.device_id || 'ESP32-AGRI-01'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Data Mode: <strong style={{ color: 'var(--primary-600)' }}>{reading.data_source || 'SIMULATION'}</strong>
          </span>
          <button 
            onClick={() => onNavigate('genai')} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Ask GenAI Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
}
