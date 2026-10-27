import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Layers, 
  Droplets, 
  Edit3, 
  Save, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function CropHealthPage({ currentReading }) {
  const [fieldData, setFieldData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const reading = currentReading || {};

  const loadFieldOverview = async () => {
    try {
      const res = await api.field.getOverview();
      if (res.success && res.data) {
        setFieldData(res.data);
        setFormData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFieldOverview();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await api.field.update(formData);
      if (res.success) {
        setSaveMsg('Field profile updated successfully.');
        setIsEditing(false);
        loadFieldOverview();
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      setSaveMsg('Failed to update field.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Crop Health & Demonstration Field Management
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Biophysical growth parameters, micro-climatic suitability analysis, and agronomic care guide.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Edit3 size={15} />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Field Parameters'}</span>
        </button>
      </div>

      {saveMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          {saveMsg}
        </div>
      )}

      {/* Editing Form (Collapsible) */}
      {isEditing && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h4 className="card-title">Update Field & Crop Profile</h4>
            <span className="badge badge-emerald">EDIT MODE</span>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Field Block Identifier</label>
                <input
                  type="text"
                  value={formData.field_name || ''}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Crop Type</label>
                <input
                  type="text"
                  value={formData.crop_name || ''}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area_acres || 3.5}
                  onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Soil Classification</label>
                <input
                  type="text"
                  value={formData.soil_type || ''}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Growth Stage</label>
                <input
                  type="text"
                  value={formData.growth_stage || ''}
                  onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Agronomic Notes & Management Plan</label>
              <textarea
                rows="3"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-control"
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Field Information'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Field Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Left: Crop Overview Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sprout size={22} color="var(--primary-600)" />
              <span>{fieldData?.field_name || 'Plot 4A - North Valley Block'}</span>
            </h3>
            <span className="badge badge-emerald">OPTIMAL HEALTH</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cultivated Crop</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {fieldData?.crop_name || 'Tomato'} (Hybrid Shivam)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                Area: {fieldData?.area_acres || 3.5} Acres (~1.42 Hectares)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Phenological Growth Stage</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                {fieldData?.growth_stage || 'Fruit Formation'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                Sowing Date: {fieldData?.sowing_date || '2026-08-15'} (Day 56)
              </div>
            </div>
          </div>

          {/* Growth Stage Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>Germination</span>
              <span>Vegetative</span>
              <strong style={{ color: 'var(--primary-600)' }}>Flowering & Fruit Set (Current)</strong>
              <span>Ripening</span>
              <span>Harvest</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '999px' }} />
            </div>
          </div>

          {/* Agronomic Notes */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            fontSize: '0.84rem',
            lineHeight: 1.6
          }}>
            <strong>Agronomist Field Notes:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              {fieldData?.notes || 'Staking completed. Soil moisture target 30-45%. Regular calcium spray scheduled for blossom end rot prevention.'}
            </p>
          </div>
        </div>

        {/* Right: Environmental Suitability Index */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <HeartPulse size={20} color="#0284c7" />
              <span>Biophysical Suitability Index</span>
            </h3>
            <span className="badge badge-emerald">88% SCORE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Root Zone Hydration</span>
                <strong style={{ color: reading.soil_moisture < 30 ? '#f59e0b' : '#10b981' }}>
                  {reading.soil_moisture ?? 28.4}% (Target 35–48%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '999px' }}>
                <div style={{ width: `${Math.min(100, (reading.soil_moisture ?? 28.4) * 2)}%`, height: '100%', background: '#10b981', borderRadius: '999px' }} />
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Canopy Temperature</span>
                <strong>{reading.temperature ?? 32.2}°C (Ideal 22–30°C)</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '999px' }}>
                <div style={{ width: '82%', height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Soil pH Buffer</span>
                <strong style={{ color: '#10b981' }}>{reading.soil_ph ?? 6.5} (Neutral Optimum)</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '999px' }}>
                <div style={{ width: '92%', height: '100%', background: '#10b981', borderRadius: '999px' }} />
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div style={{
            marginTop: '18px',
            padding: '12px',
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: '10px',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            <strong>Diagnostic Transparency:</strong> Sensor readings provide abiotic micro-climate indicators (temperature, humidity, moisture, pH). They do not diagnose biological pathogens or viral diseases, which require visual inspection or leaf-tissue laboratory assays.
          </div>
        </div>
      </div>

      {/* Potential Warning Conditions & Recommended Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <AlertTriangle size={18} color="#f59e0b" />
              <span>Potential Agronomic Risk Indicators</span>
            </h4>
          </div>
          <ul style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>
              <strong>Midday Heat Hazard:</strong> Ambient temperature reached 33°C. May trigger premature flower abscission in tomato vines if sustained above 35°C.
            </li>
            <li>
              <strong>Micro-Moisture Fluctuations:</strong> Variable drip cycles can cause calcium translocation disruption, leading to blossom-end rot.
            </li>
            <li>
              <strong>Precipitation Interruption:</strong> Low rainfall in current fortnight increases dependence on borewell irrigation recharge.
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <ShieldCheck size={18} color="var(--primary-600)" />
              <span>Recommended Farm Management Actions</span>
            </h4>
          </div>
          <ul style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>
              <strong>Irrigation Schedule:</strong> Run 40-minute drip cycles during early morning (6:00 AM) to maintain 38% moisture before midday peak heat.
            </li>
            <li>
              <strong>Nutrient Supplementation:</strong> Foliar spray of 0.5% Calcium Nitrate and Boron to strengthen cell walls during fruit enlargement.
            </li>
            <li>
              <strong>Mulching Advice:</strong> Apply silver-black plastic mulch or organic paddy straw along raised beds to reduce soil evaporation by 30%.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
