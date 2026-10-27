import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  HelpCircle, 
  Zap, 
  RefreshCw,
  Layers,
  IndianRupee,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { api } from '../services/api';

const SUPPORTED_CROPS = [
  'Tomato', 'Rice', 'Wheat', 'Maize', 
  'Cotton', 'Groundnut', 'Banana', 'Sugarcane'
];

export default function YieldPredictionPage({ currentReading }) {
  // Input states
  const [crop, setCrop] = useState('Tomato');
  const [soilMoisture, setSoilMoisture] = useState(32.0);
  const [temperature, setTemperature] = useState(28.5);
  const [humidity, setHumidity] = useState(62.0);
  const [soilPh, setSoilPh] = useState(6.5);
  const [lightLux, setLightLux] = useState(42000);
  const [areaAcres, setAreaAcres] = useState(3.5);
  const [historicalYield, setHistoricalYield] = useState(30.0);

  // Status & Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // Fetch past prediction history
  const loadHistory = async () => {
    try {
      const res = await api.prediction.getHistory();
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (e) {
      console.error('Error fetching prediction history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Autofill current IoT sensors button
  const handleAutofillSensors = () => {
    if (currentReading) {
      if (currentReading.soil_moisture !== undefined) setSoilMoisture(currentReading.soil_moisture);
      if (currentReading.temperature !== undefined) setTemperature(currentReading.temperature);
      if (currentReading.humidity !== undefined) setHumidity(currentReading.humidity);
      if (currentReading.soil_ph !== undefined) setSoilPh(currentReading.soil_ph);
      if (currentReading.light_lux !== undefined) setLightLux(currentReading.light_lux);
    }
  };

  // Run DNN Prediction
  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        crop,
        soil_moisture: Number(soilMoisture),
        temperature: Number(temperature),
        humidity: Number(humidity),
        soil_ph: Number(soilPh),
        light_lux: Number(lightLux),
        area_acres: Number(areaAcres),
        historical_yield: historicalYield ? Number(historicalYield) : null,
      };

      const res = await api.prediction.predict(payload);
      if (res.success) {
        setPredictionResult(res.data);
        loadHistory();
      }
    } catch (err) {
      setError(err.message || 'Prediction failed. Check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  // Data for comparison chart
  const comparisonData = predictionResult ? [
    { name: 'State Average', yield: predictionResult.benchmark?.state_average_t_ha || 28, color: '#94a3b8' },
    { name: 'Predicted (DNN)', yield: predictionResult.predicted_yield_t_per_ha, color: '#10b981' },
    { name: 'Genetic Record Potential', yield: predictionResult.benchmark?.potential_record_t_ha || 45, color: '#0284c7' },
  ] : [];

  return (
    <div className="page-wrapper">
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Crop Yield Prediction Using Deep Neural Networks (DNN)
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          4-Layer Multilayer Perceptron (MLP) trained on ICAR multi-variate agro-climatic curves.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left Side: Parameters Input Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BrainCircuit size={20} color="var(--primary-600)" />
              <span>Agronomic Input Parameters</span>
            </h3>

            <button
              type="button"
              onClick={handleAutofillSensors}
              className="btn btn-secondary btn-sm"
              title="Populate input fields with real-time sensor readings"
              style={{ fontSize: '0.78rem' }}
            >
              <Zap size={14} color="#f59e0b" />
              <span>Autofill Live IoT Sensors</span>
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePredict}>
            {/* Crop Selection */}
            <div className="form-group">
              <label className="form-label">Crop Variety</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="form-control"
                style={{ fontWeight: 600 }}
              >
                {SUPPORTED_CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Land Area & Historical Yield */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="500"
                  required
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Past Season Yield (t/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={historicalYield}
                  onChange={(e) => setHistoricalYield(e.target.value)}
                  placeholder="Optional baseline"
                  className="form-control"
                />
              </div>
            </div>

            {/* Environmental Sensors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Soil Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="95"
                  required
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="50"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Relative Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="15"
                  max="100"
                  required
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Soil pH Level</label>
                <input
                  type="number"
                  step="0.05"
                  min="4.0"
                  max="9.0"
                  required
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Solar Light (Lux)</label>
              <input
                type="number"
                step="100"
                min="500"
                max="80000"
                required
                value={lightLux}
                onChange={(e) => setLightLux(e.target.value)}
                className="form-control"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin-slow" />
                  <span>Computing Multi-Layer Forward Pass...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={18} />
                  <span>PREDICT CROP YIELD (RUN DNN)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Prediction Outcome Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">
                <Scale size={20} color="var(--primary-600)" />
                <span>Yield Estimation Outcome</span>
              </h3>

              {predictionResult && (
                <span className={`badge ${predictionResult.model_mode.includes('Trained') ? 'badge-emerald' : 'badge-amber'}`}>
                  {predictionResult.model_mode}
                </span>
              )}
            </div>

            {predictionResult ? (
              <div>
                {/* Highlight Numbers */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08))',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Projected Yield for {predictionResult.crop} ({predictionResult.area_acres} Acres)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '8px 0' }}>
                    <span style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--primary-600)', letterSpacing: '-0.02em' }}>
                      {predictionResult.predicted_yield_t_per_ha}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Tonnes / Hectare
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Production</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {predictionResult.total_production_tonnes} <span style={{ fontSize: '0.75rem' }}>Tonnes</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>In Quintals</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {predictionResult.total_production_quintals} <span style={{ fontSize: '0.75rem' }}>Qtl</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Est. Market Value</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                        ₹{Number(predictionResult.estimated_gross_revenue_inr).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benchmark Comparison Chart */}
                <div style={{ height: '180px', width: '100%', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                      <Bar dataKey="yield" radius={[0, 6, 6, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Limiting Factors & Agronomic Explanation */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Agronomic Factor Analysis & Uncertainty
                  </div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: 1.6 }}>
                    {predictionResult.limiting_factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                    <li>
                      95% Confidence Interval: <strong>{predictionResult.confidence_interval.range_t_per_ha[0]} - {predictionResult.confidence_interval.range_t_per_ha[1]} t/ha</strong> (±{predictionResult.confidence_interval.uncertainty_pct}%)
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)'
              }}>
                <BrainCircuit size={48} color="var(--primary-400)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  No Prediction Generated Yet
                </h4>
                <p style={{ fontSize: '0.84rem', maxWidth: '380px', margin: '0 auto' }}>
                  Select a crop, adjust moisture and micro-climate parameters on the left, and click 
                  <strong> "PREDICT CROP YIELD"</strong> to execute the neural network forward pass.
                </p>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            *Disclaimer: Projections are computed by a mathematical Deep Neural Network based on regional agricultural models. Actual yield depends also on pest infestations, micro-nutrients, and unexpected weather.
          </div>
        </div>
      </div>

      {/* Historical Yield Predictions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={18} color="var(--primary-600)" />
            <span>Past Yield Prediction History</span>
          </h3>
          <span className="badge badge-slate">{historyList.length} LOGGED FORECASTS</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Date & Time</th>
                <th style={{ padding: '12px 14px' }}>Crop</th>
                <th style={{ padding: '12px 14px' }}>Land Area</th>
                <th style={{ padding: '12px 14px' }}>Moisture</th>
                <th style={{ padding: '12px 14px' }}>Temp</th>
                <th style={{ padding: '12px 14px' }}>pH</th>
                <th style={{ padding: '12px 14px' }}>Yield (t/ha)</th>
                <th style={{ padding: '12px 14px' }}>Total (Tonnes)</th>
                <th style={{ padding: '12px 14px' }}>Model Mode</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{row.timestamp}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{row.crop}</td>
                  <td style={{ padding: '12px 14px' }}>{row.area_acres} Acres</td>
                  <td style={{ padding: '12px 14px' }}>{row.soil_moisture}%</td>
                  <td style={{ padding: '12px 14px' }}>{row.temperature}°C</td>
                  <td style={{ padding: '12px 14px' }}>{row.soil_ph}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--primary-600)' }}>
                    {row.predicted_yield_t_per_ha}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                    {row.total_production_tonnes} t
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      {row.model_mode}
                    </span>
                  </td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No predictions recorded yet. Run your first forecast above!
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
