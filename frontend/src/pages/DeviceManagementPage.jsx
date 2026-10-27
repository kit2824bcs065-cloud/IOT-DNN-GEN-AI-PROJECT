import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Cloud, 
  Terminal, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  Key
} from 'lucide-react';
import { api } from '../services/api';

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState([]);
  const [awsStatus, setAwsStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const [devRes, awsRes] = await Promise.all([
        api.devices.getAll(),
        api.cloud.getAwsStatus(),
      ]);
      if (devRes.success) setDevices(devRes.data || []);
      if (awsRes.success) setAwsStatus(awsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          IoT Device Management & Gateway Architecture
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Proposed microcontroller node topology, sensor availability map, and AWS IoT Core MQTT gateway interface.
        </p>
      </div>

      {/* Cloud & AWS IoT Core Architecture Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(2, 132, 199, 0.25)',
        marginBottom: '28px'
      }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '12px'
            }}>
              <Cloud size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                AWS IoT Core Cloud Integration Architecture
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Modular adapter pattern: Designed to connect with AWS IoT MQTT broker when configured.
              </p>
            </div>
          </div>

          <span className={`badge ${awsStatus?.aws_iot_configured ? 'badge-emerald' : 'badge-slate'}`}>
            {awsStatus?.status_label || 'LOCAL REST PROTOCOL (AWS READY)'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          margin: '18px 0',
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>MQTT Broker Endpoint</div>
            <code style={{ fontSize: '0.8rem', color: 'var(--primary-600)', wordBreak: 'break-all' }}>
              {awsStatus?.broker_endpoint || 'iot.ap-south-1.amazonaws.com (Unconfigured)'}
            </code>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Device Shadow Topic</div>
            <code style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
              {awsStatus?.shadow_topic || 'smart-agri/device/ESP32-AGRI-01/shadow'}
            </code>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Telemetry Ingestion Topic</div>
            <code style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
              {awsStatus?.telemetry_topic || 'smart-agri/telemetry/ESP32-AGRI-01'}
            </code>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>Transparency Notice:</strong> Currently, telemetry flows directly over the local Python Flask REST API 
          (<code>/api/sensors/telemetry</code>). When deployment to AWS is required for field scale, the gateway accepts AWS X.509 device certificates without altering frontend client code.
        </p>
      </div>

      {/* IoT Devices Grid */}
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h3 className="card-title">
          <Cpu size={20} color="var(--primary-600)" />
          <span>Registered IoT Sensor Nodes (Topology)</span>
        </h3>
        <span className="badge badge-slate">{devices.length} NODES CONFIGURED</span>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        {devices.map((device) => {
          const isHardware = device.source_type === 'HARDWARE';

          return (
            <div key={device.device_id} className="card" style={{ position: 'relative' }}>
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{device.device_name}</h4>
                    <span className={`badge ${device.status === 'ONLINE' ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.68rem' }}>
                      {device.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    ID: <code>{device.device_id}</code> • Type: {device.device_type}
                  </span>
                </div>

                <div style={{
                  background: isHardware ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: isHardware ? '#10b981' : '#f59e0b',
                  padding: '10px',
                  borderRadius: '12px'
                }}>
                  <Cpu size={24} />
                </div>
              </div>

              {/* Provenance Pill */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Data Generation Source:</span>
                <span className={`badge ${isHardware ? 'badge-emerald' : 'badge-amber'}`}>
                  {isHardware ? 'REAL HARDWARE (ESP32)' : 'SIMULATION MODE (DEMO)'}
                </span>
              </div>

              {/* Device Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deployment Site:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{device.location}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Firmware Build:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{device.firmware_version}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Internal Network IP:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{device.ip_address}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Last Synchronization:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{device.last_seen}</div>
                </div>
              </div>

              {/* Connected Sensors Map */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Hardware Sensor Bus Mapping:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>Soil Moisture (ADC 34)</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>DHT22 Temp & Hum (GPIO 4)</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>Soil pH Probe (ADC 35)</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>LDR Lux Sensor (ADC 32)</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>Rain Sensor (GPIO 27)</span>
                  <span className="badge badge-blue" style={{ fontSize: '0.66rem' }}>Relay Actuator (GPIO 26)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ESP32 Wiring Hardware Architecture Guide */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            <Terminal size={18} color="var(--primary-600)" />
            <span>ESP32 Physical Microcontroller Pinout Reference</span>
          </h4>
          <span className="badge badge-slate">COLLEGE DEMO GUIDE</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Sensor / Actuator</th>
                <th style={{ padding: '10px 14px' }}>ESP32 GPIO Pin</th>
                <th style={{ padding: '10px 14px' }}>Signal Protocol</th>
                <th style={{ padding: '10px 14px' }}>Voltage</th>
                <th style={{ padding: '10px 14px' }}>Agronomic Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Capacitive Soil Moisture v1.2</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 34 (ADC1_CH6)</code></td>
                <td style={{ padding: '10px 14px' }}>Analog (0-4095)</td>
                <td style={{ padding: '10px 14px' }}>3.3V</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Measures volumetric water content without electrode corrosion</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>DHT22 / AM2302</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 4</code></td>
                <td style={{ padding: '10px 14px' }}>1-Wire Digital</td>
                <td style={{ padding: '10px 14px' }}>3.3V / 5V</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Ambient temperature & humidity for transpirational calculation</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Analog Soil pH Sensor</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 35 (ADC1_CH7)</code></td>
                <td style={{ padding: '10px 14px' }}>Analog Voltage</td>
                <td style={{ padding: '10px 14px' }}>5V (Module)</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Assesses soil acidity/alkalinity for optimal nutrient uptake</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>LDR Photocell Module</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 32 (ADC1_CH4)</code></td>
                <td style={{ padding: '10px 14px' }}>Analog Divider</td>
                <td style={{ padding: '10px 14px' }}>3.3V</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Monitors sunlight lux for diurnal photosynthetic activity</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Precipitation Sensor Plate</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 27</code></td>
                <td style={{ padding: '10px 14px' }}>Digital Interrupt</td>
                <td style={{ padding: '10px 14px' }}>3.3V</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Interrupts automatic irrigation when natural rainfall occurs</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Relay Channel 1 (Pump)</td>
                <td style={{ padding: '10px 14px' }}><code>GPIO 26</code></td>
                <td style={{ padding: '10px 14px' }}>Active LOW Output</td>
                <td style={{ padding: '10px 14px' }}>5V Relay Coil</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Energizes 230V AC / 12V DC water pump motor via contact relay</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
