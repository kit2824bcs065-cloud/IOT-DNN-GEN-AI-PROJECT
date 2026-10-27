import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter, 
  Droplets, 
  Thermometer, 
  Activity, 
  TrendingUp, 
  Clock, 
  FileText,
  Radio
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
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d'
  const [historyData, setHistoryData] = useState([]);
  const [predictionsData, setPredictionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const limit = timeRange === '24h' ? 24 : timeRange === '7d' ? 84 : 168;
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      
      const [sensRes, predRes] = await Promise.all([
        api.sensors.getHistory(limit, days),
        api.prediction.getHistory(),
      ]);

      if (sensRes.success) setHistoryData(sensRes.data || []);
      if (predRes.success) setPredictionsData(predRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const handleExportCsv = (type) => {
    const url = api.reports.getExportUrl(type);
    window.open(url, '_blank');
  };

  const chartData = historyData.map(item => ({
    timestamp: item.recorded_at ? item.recorded_at.split(' ')[0].substring(5) + ' ' + item.recorded_at.split(' ')[1].substring(0, 5) : '',
    moisture: item.soil_moisture,
    temp: item.temperature,
    humidity: item.humidity,
    ph: item.soil_ph,
    is_sim: item.is_simulated,
  }));

  return (
    <div className="page-wrapper">
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Historical Agronomic Reports & Analytics
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Time-series telemetry archival, multi-day sensor trends, and CSV dataset export.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* CSV Sensor Export */}
          <button
            onClick={() => handleExportCsv('sensors')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>Export Sensor CSV</span>
          </button>

          {/* CSV Predictions Export */}
          <button
            onClick={() => handleExportCsv('predictions')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>Export Yield DNN CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector & Data Origin Notice */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="var(--primary-600)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Select Archive Horizon:</span>
          
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setTimeRange('24h')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: timeRange === '24h' ? 'var(--primary-600)' : 'transparent',
                color: timeRange === '24h' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: timeRange === '7d' ? 'var(--primary-600)' : 'transparent',
                color: timeRange === '7d' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: timeRange === '30d' ? 'var(--primary-600)' : 'transparent',
                color: timeRange === '30d' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Radio size={14} color="#f59e0b" />
          <span>Showing <strong>{historyData.length} records</strong> • Origin: <strong>Simulated Demo Historical Log</strong></span>
        </div>
      </div>

      {/* Primary Historical Chart: Moisture & Temperature */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Droplets size={20} color="var(--primary-600)" />
            <span>Soil Moisture (%) & Temperature (°C) Chronological Evolution</span>
          </h3>
          <span className="badge badge-emerald">SQLITE TIME SERIES</span>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} interval="preserveStartEnd" />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px' }} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="moisture" name="Soil Moisture (%)" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="temp" name="Ambient Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Humidity and Soil pH */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Activity size={20} color="#0284c7" />
            <span>Relative Humidity (%) & Soil pH Trends</span>
          </h3>
          <span className="badge badge-blue">CANOPY STABILITY</span>
        </div>

        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humidityArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} interval="preserveStartEnd" />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '10px' }} />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#humidityArea)" />
              <Line type="monotone" dataKey="ph" name="Soil pH" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sensor Log Samples Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FileText size={18} color="var(--primary-600)" />
            <span>Recent Sensor Reading Sample Stream</span>
          </h3>
          <span className="badge badge-slate">SHOWING TOP 15 SAMPLES</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Recorded At</th>
                <th style={{ padding: '12px 14px' }}>Device ID</th>
                <th style={{ padding: '12px 14px' }}>Soil Moisture</th>
                <th style={{ padding: '12px 14px' }}>Temperature</th>
                <th style={{ padding: '12px 14px' }}>Humidity</th>
                <th style={{ padding: '12px 14px' }}>Soil pH</th>
                <th style={{ padding: '12px 14px' }}>Light (Lux)</th>
                <th style={{ padding: '12px 14px' }}>Precipitation</th>
                <th style={{ padding: '12px 14px' }}>Data Provenance</th>
              </tr>
            </thead>
            <tbody>
              {historyData.slice(-15).reverse().map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{r.recorded_at}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.device_id || 'ESP32-AGRI-01'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: r.soil_moisture < 30 ? '#ef4444' : '#10b981' }}>
                    {r.soil_moisture}%
                  </td>
                  <td style={{ padding: '12px 14px' }}>{r.temperature}°C</td>
                  <td style={{ padding: '12px 14px' }}>{r.humidity}%</td>
                  <td style={{ padding: '12px 14px' }}>{r.soil_ph}</td>
                  <td style={{ padding: '12px 14px' }}>{Number(r.light_lux || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${r.rain_detected ? 'badge-blue' : 'badge-slate'}`} style={{ fontSize: '0.68rem' }}>
                      {r.rain_detected ? 'RAIN' : 'DRY'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${r.is_simulated ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.68rem' }}>
                      {r.is_simulated ? 'DEMO SIMULATION' : 'PHYSICAL HARDWARE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
