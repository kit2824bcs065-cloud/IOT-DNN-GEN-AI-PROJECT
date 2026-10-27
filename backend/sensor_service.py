"""
IoT Sensor Service for Smart Crop Monitoring.
Supports both simulated sensor data generation with realistic diurnal variation
and genuine ESP32 hardware telemetry ingestion via REST endpoint.
"""

import math
import random
from datetime import datetime, timedelta
from database import get_db_connection

# In-memory sensor state for real-time simulation and hardware cache
_latest_sensor_state = {
    "device_id": "ESP32-AGRI-01",
    "soil_moisture": 28.4,
    "temperature": 32.2,
    "humidity": 58.0,
    "soil_ph": 6.5,
    "light_lux": 42500.0,
    "rain_detected": 0,
    "nitrogen": 142.0,
    "phosphorus": 41.5,
    "potassium": 184.0,
    "show_npk": True,
    "is_simulated": True,
    "data_source": "SIMULATION (DEMO MODE)",
    "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

def get_sensor_health_status(reading):
    """
    Evaluates agronomic thresholds for Indian crops (Tomato default).
    Returns health status dictionary with color cues and agricultural advisories.
    """
    moisture = reading.get("soil_moisture", 30)
    temp = reading.get("temperature", 28)
    humidity = reading.get("humidity", 60)
    ph = reading.get("soil_ph", 6.5)
    rain = reading.get("rain_detected", 0)

    # Soil Moisture evaluation
    if moisture < 25.0:
        moisture_status = {"level": "CRITICAL", "message": "Severe moisture deficit! Immediate irrigation required.", "color": "red"}
    elif moisture < 32.0:
        moisture_status = {"level": "WARNING", "message": "Soil drying below comfort zone for flowering crops.", "color": "amber"}
    elif moisture <= 65.0:
        moisture_status = {"level": "NORMAL", "message": "Optimal root zone moisture maintained.", "color": "emerald"}
    else:
        moisture_status = {"level": "WARNING", "message": "High moisture. Potential risk of root asphyxiation.", "color": "amber"}

    # Temperature evaluation
    if temp > 36.0:
        temp_status = {"level": "CRITICAL", "message": "Severe heat stress! Flower drop probable.", "color": "red"}
    elif temp > 33.0:
        temp_status = {"level": "WARNING", "message": "Elevated midday temperature.", "color": "amber"}
    elif temp < 16.0:
        temp_status = {"level": "WARNING", "message": "Chilling hazard. Growth slowdown.", "color": "blue"}
    else:
        temp_status = {"level": "NORMAL", "message": "Ideal vegetative & fruit development temperature.", "color": "emerald"}

    # Humidity evaluation
    if humidity > 85.0:
        humidity_status = {"level": "WARNING", "message": "Excessive humidity: Monitor for Early Blight & Powdery Mildew.", "color": "amber"}
    elif humidity < 40.0:
        humidity_status = {"level": "WARNING", "message": "Dry ambient air accelerates transpiration.", "color": "amber"}
    else:
        humidity_status = {"level": "NORMAL", "message": "Favorable transpiration range.", "color": "emerald"}

    # Soil pH evaluation
    if ph < 5.8:
        ph_status = {"level": "WARNING", "message": "Acidic soil: Phosphorus & Calcium fixation risk.", "color": "amber"}
    elif ph > 7.5:
        ph_status = {"level": "WARNING", "message": "Alkaline soil: Iron & Micronutrient chlorosis risk.", "color": "amber"}
    else:
        ph_status = {"level": "NORMAL", "message": "Near-neutral optimal range (6.0 - 7.0) for root nutrient uptake.", "color": "emerald"}

    rain_status = {
        "level": "INFO" if rain == 0 else "WARNING",
        "message": "Rainfall detected in field. Hold off irrigation cycles." if rain == 1 else "No rainfall detected by IoT precipitation sensor.",
        "color": "blue" if rain == 1 else "emerald"
    }

    return {
        "moisture": moisture_status,
        "temperature": temp_status,
        "humidity": humidity_status,
        "ph": ph_status,
        "rain": rain_status
    }

def get_current_reading():
    """Returns the latest reading combined with health evaluations."""
    global _latest_sensor_state
    # Check if database has newer reading
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT device_id, soil_moisture, temperature, humidity, soil_ph, light_lux, 
           rain_detected, nitrogen, phosphorus, potassium, is_simulated, recorded_at
    FROM sensor_readings
    ORDER BY recorded_at DESC
    LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if row:
        _latest_sensor_state["device_id"] = row["device_id"]
        _latest_sensor_state["soil_moisture"] = round(row["soil_moisture"], 1)
        _latest_sensor_state["temperature"] = round(row["temperature"], 1)
        _latest_sensor_state["humidity"] = round(row["humidity"], 1)
        _latest_sensor_state["soil_ph"] = round(row["soil_ph"], 2)
        _latest_sensor_state["light_lux"] = round(row["light_lux"], 0)
        _latest_sensor_state["rain_detected"] = int(row["rain_detected"])
        _latest_sensor_state["nitrogen"] = round(row["nitrogen"], 1)
        _latest_sensor_state["phosphorus"] = round(row["phosphorus"], 1)
        _latest_sensor_state["potassium"] = round(row["potassium"], 1)
        _latest_sensor_state["is_simulated"] = bool(row["is_simulated"])
        _latest_sensor_state["data_source"] = "SIMULATION (DEMO DATA)" if row["is_simulated"] else "LIVE HARDWARE (ESP32)"
        _latest_sensor_state["last_updated"] = row["recorded_at"]

    result = dict(_latest_sensor_state)
    result["health_analysis"] = get_sensor_health_status(result)
    return result

def simulate_sensor_tick(override_pump_running=False):
    """
    Simulates a time-step in sensor readings with natural Brownian physics.
    If the pump is running, soil moisture rises realistically.
    """
    global _latest_sensor_state

    # Current time factor
    now = datetime.now()
    hour = now.hour

    # Temperature oscillation
    target_temp = 28.0 + 5.5 * math.sin((hour - 8) * math.pi / 12)
    new_temp = round(max(18.0, min(42.0, _latest_sensor_state["temperature"] * 0.85 + target_temp * 0.15 + random.uniform(-0.4, 0.4))), 1)

    # Humidity opposite of temperature
    target_humidity = 80.0 - (new_temp - 20.0) * 2.2
    new_humidity = round(max(35.0, min(95.0, _latest_sensor_state["humidity"] * 0.85 + target_humidity * 0.15 + random.uniform(-0.6, 0.6))), 1)

    # Light Lux based on sun position
    if 6 <= hour <= 18:
        sun_factor = math.sin((hour - 6) * math.pi / 12)
        new_light = round(max(500.0, 52000.0 * sun_factor + random.uniform(-1500, 1500)), 0)
    else:
        new_light = round(random.uniform(0, 50), 0)

    # Soil Moisture:
    if override_pump_running:
        # Pump is running, moisture increases
        new_moisture = round(min(75.0, _latest_sensor_state["soil_moisture"] + random.uniform(1.2, 2.5)), 1)
    else:
        # Moisture naturally evaporates slowly
        decay = 0.1 + (0.15 if new_temp > 30 else 0.05)
        new_moisture = round(max(20.0, _latest_sensor_state["soil_moisture"] - decay + random.uniform(-0.05, 0.05)), 1)

    # Soil pH fluctuates very slightly
    new_ph = round(max(5.8, min(7.6, _latest_sensor_state["soil_ph"] + random.uniform(-0.02, 0.02))), 2)

    # Rain sensor (rarely triggers unless forced)
    rain = 1 if (_latest_sensor_state.get("rain_detected", 0) == 1 and random.random() > 0.1) else 0

    # NPK drift slightly
    new_n = round(max(110.0, min(170.0, _latest_sensor_state["nitrogen"] + random.uniform(-0.4, 0.4))), 1)
    new_p = round(max(30.0, min(55.0, _latest_sensor_state["phosphorus"] + random.uniform(-0.2, 0.2))), 1)
    new_k = round(max(150.0, min(210.0, _latest_sensor_state["potassium"] + random.uniform(-0.5, 0.5))), 1)

    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

    # Update in-memory
    _latest_sensor_state.update({
        "soil_moisture": new_moisture,
        "temperature": new_temp,
        "humidity": new_humidity,
        "soil_ph": new_ph,
        "light_lux": new_light,
        "rain_detected": rain,
        "nitrogen": new_n,
        "phosphorus": new_p,
        "potassium": new_k,
        "is_simulated": True,
        "data_source": "SIMULATION (DEMO DATA)",
        "last_updated": timestamp
    })

    # Record into SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sensor_readings (device_id, soil_moisture, temperature, humidity, soil_ph, light_lux, rain_detected, nitrogen, phosphorus, potassium, is_simulated, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        _latest_sensor_state["device_id"],
        new_moisture, new_temp, new_humidity, new_ph, new_light, rain,
        new_n, new_p, new_k, 1, timestamp
    ))
    conn.commit()
    conn.close()

    return get_current_reading()

def ingest_hardware_telemetry(payload):
    """
    Modular receiver for real ESP32 / Arduino / AWS IoT hardware.
    Validates and stores true physical sensor readings.
    """
    global _latest_sensor_state

    device_id = payload.get("device_id", "ESP32-HARDWARE-01")
    soil_moisture = float(payload.get("soil_moisture", 30.0))
    temperature = float(payload.get("temperature", 28.0))
    humidity = float(payload.get("humidity", 60.0))
    soil_ph = float(payload.get("soil_ph", 6.5))
    light_lux = float(payload.get("light_lux", 1000.0))
    rain_detected = int(payload.get("rain_detected", 0))
    nitrogen = float(payload.get("nitrogen", 140.0))
    phosphorus = float(payload.get("phosphorus", 42.0))
    potassium = float(payload.get("potassium", 185.0))

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update device registry to indicate active physical connection
    cursor.execute("""
    INSERT INTO device_registry (device_id, device_name, device_type, location, status, source_type, last_seen)
    VALUES (?, ?, ?, ?, 'ONLINE', 'HARDWARE', ?)
    ON CONFLICT(device_id) DO UPDATE SET
        status='ONLINE', source_type='HARDWARE', last_seen=excluded.last_seen
    """, (device_id, f"Hardware Node ({device_id})", "ESP32-Physical", "Live Field Site", timestamp))

    cursor.execute("""
    INSERT INTO sensor_readings (device_id, soil_moisture, temperature, humidity, soil_ph, light_lux, rain_detected, nitrogen, phosphorus, potassium, is_simulated, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (device_id, soil_moisture, temperature, humidity, soil_ph, light_lux, rain_detected, nitrogen, phosphorus, potassium, timestamp))

    conn.commit()
    conn.close()

    _latest_sensor_state.update({
        "device_id": device_id,
        "soil_moisture": soil_moisture,
        "temperature": temperature,
        "humidity": humidity,
        "soil_ph": soil_ph,
        "light_lux": light_lux,
        "rain_detected": rain_detected,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "is_simulated": False,
        "data_source": f"LIVE HARDWARE ({device_id})",
        "last_updated": timestamp
    })

    return get_current_reading()

def get_historical_sensor_data(limit=48, days=7):
    """Returns chronological sensor readings for historical trends and charts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT recorded_at, soil_moisture, temperature, humidity, soil_ph, light_lux, rain_detected, is_simulated
    FROM sensor_readings
    ORDER BY recorded_at DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    # Return chronological order (oldest to newest)
    result = [dict(r) for r in reversed(rows)]
    return result
