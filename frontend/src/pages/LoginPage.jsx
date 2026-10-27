import React, { useState } from 'react';
import { 
  Sprout, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('Kisan Organic Farms');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [phone, setPhone] = useState('+91 98421 78901');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('smart_agri_token', res.user.token);
        localStorage.setItem('smart_agri_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login({ is_demo_login: true });
      if (res.success) {
        localStorage.setItem('smart_agri_token', res.user.token);
        localStorage.setItem('smart_agri_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError('Demo login failed. Ensure the Flask backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.register({
        email,
        password,
        full_name: fullName,
        farm_name: farmName,
        location,
        phone,
      });
      if (res.success) {
        localStorage.setItem('smart_agri_token', res.user.token);
        localStorage.setItem('smart_agri_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email, new_password: newPassword });
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f172a 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative ambient glowing circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '1050px',
        background: 'var(--bg-surface)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        {/* Left Side: Educational / Agricultural Project Showcase */}
        <div style={{
          background: 'linear-gradient(145deg, #047857 0%, #065f46 60%, #064e3b 100%)',
          padding: '44px 38px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sprout size={28} color="#a7f3d0" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
                  College Engineering Project
                </span>
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>SmartAgri Platform</h2>
              </div>
            </div>

            <h1 style={{ fontSize: '1.85rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              IoT Monitoring, DNN Yield Prediction & GenAI Farmer Assistance
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#d1fae5', lineHeight: 1.6, marginBottom: '28px' }}>
              An interactive precision agriculture system combining ESP32 multi-sensor telemetry, 
              deep neural network harvest forecasting, and bilingual (English & தமிழ்) farmer advisory.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <Cpu size={22} color="#6ee7b7" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', color: '#ffffff', marginBottom: '4px' }}>IoT Telemetry</h4>
                <p style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>Moisture, DHT22, pH, LDR, Rain & NPK sensors</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <TrendingUp size={22} color="#93c5fd" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', color: '#ffffff', marginBottom: '4px' }}>DNN Prediction</h4>
                <p style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>4-Layer MLP predicting Tonnes/Ha yield</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <Sparkles size={22} color="#fde047" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', color: '#ffffff', marginBottom: '4px' }}>GenAI Assistant</h4>
                <p style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>English & Tamil advisory linked to telemetry</p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <ShieldCheck size={22} color="#fbcfe8" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.88rem', color: '#ffffff', marginBottom: '4px' }}>Smart Irrigation</h4>
                <p style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>Auto threshold trigger with relay simulation</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', color: '#a7f3d0' }}>Currency: Indian Rupee (₹) • ICAR Benchmarks</span>
            <span className="badge badge-emerald" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>DEMO READY</span>
          </div>
        </div>

        {/* Right Side: Form / Login / Register / Demo */}
        <div style={{ padding: '44px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'login' ? 'var(--primary-600)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Farmer Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'register' ? 'var(--primary-600)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login Pill Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Sparkles size={18} />
              <span>🚀 One-Click Demo Farmer Login (Pre-configured)</span>
            </button>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
              Instant login as demo user <code>farmer@kisan.in</code>
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0 20px',
            color: 'var(--text-subtle)',
            fontSize: '0.78rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ padding: '0 10px' }}>OR USE YOUR CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Error / Success Alerts */}
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

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              marginBottom: '16px'
            }}>
              {successMsg}
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. farmer@kisan.in"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-control"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Farm Dashboard'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Form: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thiru R. Murugesan"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. murugesan@kisan.in"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Farm / Estate Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location (District/State)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Create Password (min 6 characters)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
              >
                {loading ? 'Creating Account...' : 'Complete Farmer Registration'}
              </button>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Enter your registered email address and choose a new password.
              </p>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@kisan.in"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
              >
                {loading ? 'Resetting...' : 'Reset Password & Return'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
