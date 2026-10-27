import React, { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  User, 
  Key, 
  ShieldCheck, 
  Layers, 
  Award, 
  Info, 
  Check, 
  IndianRupee,
  Terminal,
  Cpu
} from 'lucide-react';

export default function SettingsPage({ theme, toggleTheme, user }) {
  const [farmerName, setFarmerName] = useState(user?.full_name || 'Thiru R. Murugesan');
  const [farmName, setFarmName] = useState(user?.farm_name || 'Vaanavil Organic Farm');
  const [location, setLocation] = useState(user?.location || 'Pollachi, Coimbatore, Tamil Nadu');
  const [phone, setPhone] = useState(user?.phone || '+91 98421 78901');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      full_name: farmerName,
      farm_name: farmName,
      location,
      phone
    };
    localStorage.setItem('smart_agri_user', JSON.stringify(updatedUser));
    setSavedMsg('Farmer profile preferences saved in local session storage.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          System Settings & Platform Preferences
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Theme customization, agricultural profile management, API keys, and project specifications.
        </p>
      </div>

      {savedMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          {savedMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Theme Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {theme === 'dark' ? <Moon size={20} color="#f59e0b" /> : <Sun size={20} color="#059669" />}
              <span>Interface Theme Customization</span>
            </h3>
            <span className="badge badge-emerald">ACTIVE: {theme.toUpperCase()}</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
            Toggle between High-Contrast Dark Mode and Crisp Agricultural Light Mode. 
            Preferences are automatically saved into your browser's persistent <code>localStorage</code>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {/* Light Mode Option */}
            <div
              onClick={() => theme !== 'light' && toggleTheme()}
              style={{
                border: `2px solid ${theme === 'light' ? 'var(--primary-600)' : 'var(--border-color)'}`,
                borderRadius: '14px',
                padding: '16px',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: theme === 'light' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Sun size={20} color="#059669" />
                {theme === 'light' && <Check size={18} color="#059669" />}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Light Theme</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>High daytime readability for outdoor sun</div>
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => theme !== 'dark' && toggleTheme()}
              style={{
                border: `2px solid ${theme === 'dark' ? 'var(--primary-600)' : 'var(--border-color)'}`,
                borderRadius: '14px',
                padding: '16px',
                background: '#0b1120',
                color: '#f8fafc',
                cursor: 'pointer',
                boxShadow: theme === 'dark' ? '0 0 15px rgba(5, 150, 105, 0.3)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Moon size={20} color="#f59e0b" />
                {theme === 'dark' && <Check size={18} color="#10b981" />}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Dark Theme</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>OLED deep slate for low-light night monitoring</div>
            </div>
          </div>

          <button onClick={toggleTheme} className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
            <span>Switch Theme Now</span>
          </button>
        </div>

        {/* Farmer Profile Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={20} color="var(--primary-600)" />
              <span>Farmer Account & Profile</span>
            </h3>
            <span className="badge badge-slate">AUTHENTICATED</span>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Farm / Estate Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Location (District/State)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <span>Save Profile Updates</span>
            </button>
          </form>
        </div>
      </div>

      {/* College Project Submission Metadata Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Award size={20} color="var(--primary-600)" />
            <span>Academic Project Specification & Technology Stack</span>
          </h3>
          <span className="badge badge-emerald">FINAL YEAR SUBMISSION</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '14px 0 20px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FRONTEND</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>React 18 & Vite</div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Recharts, Lucide React, Vanilla CSS</p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BACKEND</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>Python & Flask</div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>REST API, SQLite, PBKDF2 Hashing</p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI & MACHINE LEARNING</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>DNN & GenAI</div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>14-64-32-16-1 MLP, Gemini / Bilingual</p>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>IOT & CLOUD</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>ESP32 & AWS Ready</div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>DHT22, Soil Moisture, pH, Rain, LDR, Relay</p>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface-elevated)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6
        }}>
          <strong>Project Title:</strong> Smart Crop Monitoring, Yield Prediction & GenAI Farmer Assistance Using IoT, Cloud, Deep Neural Networks and Generative AI.
          <br />
          <strong>Demonstration Standard:</strong> All currency figures are rendered in Indian Rupees (₹). Deep Learning inference runs genuine mathematical forward passes against agronomic coefficients with clear "Trained DNN Model" or "Demo Mode" disclosures.
        </div>
      </div>
    </div>
  );
}
