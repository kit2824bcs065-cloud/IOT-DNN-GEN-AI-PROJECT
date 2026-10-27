# IoT Telemetry & Agricultural Data Layer

## Data Schema & Storage
The prototype persists records into SQLite (`backend/smart_farming.db`):
- `sensor_readings`: Chronological time-series stream of capacitive soil moisture, DHT22 ambient temperature and humidity, analog soil pH, calibrated LDR lux, rain detector, and optional NPK sensor.
- `irrigation_logs`: Automated and manual pump activation events, soil moisture thresholds, and relay state logs.
- `yield_predictions`: Prediction inputs, DNN inference outcomes (t/ha, total tonnes), and agronomic factor analyses.
- `chat_history`: GenAI farmer conversations in English and Tamil.
- `device_registry`: Hardware devices (ESP32-WROOM-32, ESP32-S3) with MAC addresses, connection status, and telemetry endpoints.

## Real Hardware Telemetry Ingestion
Physical ESP32 microcontrollers can POST sensor telemetry directly via Wi-Fi:
- **Endpoint**: `http://<SERVER_IP>:5000/api/sensors/telemetry`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Payload Example**: See `data/sample_esp32_payload.json`
