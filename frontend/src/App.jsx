import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import LiveSensorsPage from './pages/LiveSensorsPage';
import YieldPredictionPage from './pages/YieldPredictionPage';
import GenAiAssistantPage from './pages/GenAiAssistantPage';
import SmartIrrigationPage from './pages/SmartIrrigationPage';
import CropHealthPage from './pages/CropHealthPage';
import ReportsPage from './pages/ReportsPage';
import DeviceManagementPage from './pages/DeviceManagementPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smart_agri_theme') || 'light';
  });

  // User authentication state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_agri_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active page state
  const [activeTab, setActiveTab] = useState('overview');

  // Live telemetry state
  const [currentReading, setCurrentReading] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [isTickLoading, setIsTickLoading] = useState(false);
  const [isPumpLoading, setIsPumpLoading] = useState(false);

  // Sync theme attribute to HTML document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smart_agri_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch live sensor data and history
  const fetchTelemetry = async () => {
    try {
      const [liveRes, histRes] = await Promise.all([
        api.sensors.getLive(),
        api.sensors.getHistory(36, 7),
      ]);

      if (liveRes.success) setCurrentReading(liveRes.data);
      if (histRes.success) setHistoryData(histRes.data);
    } catch (err) {
      console.warn('Backend connection error (Ensure backend is running):', err);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchTelemetry();
    }
  }, [user]);

  // Automated Brownian drift interval (every 4 seconds)
  useEffect(() => {
    if (!user || !autoSimulate) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.sensors.tick();
        if (res.success && res.data) {
          setCurrentReading(res.data);
          // Append new point to history
          setHistoryData(prev => [...prev.slice(-35), res.data]);
        }
      } catch (e) {
        console.warn('Simulation tick paused due to connection:', e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, autoSimulate]);

  // Manual simulation step
  const triggerTick = async () => {
    setIsTickLoading(true);
    try {
      const res = await api.sensors.tick();
      if (res.success && res.data) {
        setCurrentReading(res.data);
        setHistoryData(prev => [...prev.slice(-35), res.data]);
      }
    } catch (e) {
      console.error('Tick error:', e);
    } finally {
      setIsTickLoading(false);
    }
  };

  // Pump toggle
  const handleTogglePump = async (targetState) => {
    setIsPumpLoading(true);
    try {
      const res = await api.irrigation.setPump(targetState, 'MANUAL');
      if (res.success) {
        // Refresh reading
        const liveRes = await api.sensors.getLive();
        if (liveRes.success) setCurrentReading(liveRes.data);
      }
    } catch (err) {
      console.error('Failed to toggle pump:', err);
    } finally {
      setIsPumpLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('smart_agri_token');
    localStorage.removeItem('smart_agri_user');
    setUser(null);
    setActiveTab('overview');
  };

  // If not logged in, render the login page
  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Active page router
  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            currentReading={currentReading}
            historyData={historyData}
            onNavigate={(tab) => setActiveTab(tab)}
            onTogglePump={handleTogglePump}
            isPumpLoading={isPumpLoading}
          />
        );
      case 'sensors':
        return (
          <LiveSensorsPage
            currentReading={currentReading}
            historyData={historyData}
            autoSimulate={autoSimulate}
            setAutoSimulate={setAutoSimulate}
            triggerTick={triggerTick}
            isTickLoading={isTickLoading}
          />
        );
      case 'prediction':
        return <YieldPredictionPage currentReading={currentReading} />;
      case 'genai':
        return <GenAiAssistantPage currentReading={currentReading} user={user} />;
      case 'irrigation':
        return (
          <SmartIrrigationPage
            currentReading={currentReading}
            onTogglePump={handleTogglePump}
            isPumpLoading={isPumpLoading}
          />
        );
      case 'health':
        return <CropHealthPage currentReading={currentReading} />;
      case 'reports':
        return <ReportsPage />;
      case 'devices':
        return <DeviceManagementPage />;
      case 'settings':
        return <SettingsPage theme={theme} toggleTheme={toggleTheme} user={user} />;
      default:
        return (
          <DashboardOverview
            currentReading={currentReading}
            historyData={historyData}
            onNavigate={(tab) => setActiveTab(tab)}
            onTogglePump={handleTogglePump}
            isPumpLoading={isPumpLoading}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* 10-Item Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          autoSimulate={autoSimulate}
          setAutoSimulate={setAutoSimulate}
          triggerTick={triggerTick}
          isTickLoading={isTickLoading}
          currentReading={currentReading}
          user={user}
        />

        {renderActivePage()}
      </div>
    </div>
  );
}

