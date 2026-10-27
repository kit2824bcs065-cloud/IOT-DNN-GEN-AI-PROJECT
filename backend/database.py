"""
Database initialization and models for Smart Crop Monitoring System.
Uses SQLite for zero-configuration, robust college project demonstration.
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta
import random

DB_FILE = os.path.join(os.path.dirname(__file__), "smart_farming.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        farm_name TEXT DEFAULT 'Kisan Agro Farm',
        location TEXT DEFAULT 'Coimbatore, Tamil Nadu',
        phone TEXT DEFAULT '+91 98765 43210',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Sensor Readings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        soil_moisture REAL NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        soil_ph REAL NOT NULL,
        light_lux REAL NOT NULL,
        rain_detected INTEGER NOT NULL,
        nitrogen REAL DEFAULT 140.0,
        phosphorus REAL DEFAULT 42.0,
        potassium REAL DEFAULT 185.0,
        is_simulated INTEGER DEFAULT 1,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Irrigation Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS irrigation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,           -- 'PUMP_ON', 'PUMP_OFF'
        mode TEXT NOT NULL,             -- 'AUTO', 'MANUAL'
        triggered_by TEXT NOT NULL,     -- 'Moisture Threshold < 30%', 'User Override', 'Scheduled'
        moisture_level REAL NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Crop Yield Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS yield_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        crop TEXT NOT NULL,
        area_acres REAL NOT NULL,
        soil_moisture REAL NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        soil_ph REAL NOT NULL,
        light_lux REAL NOT NULL,
        historical_yield REAL,
        predicted_yield_t_per_ha REAL NOT NULL,
        total_production_tonnes REAL NOT NULL,
        model_mode TEXT DEFAULT 'Demo Mode (DNN Architecture)',
        factors_summary TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Chat History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sender TEXT NOT NULL,           -- 'user', 'assistant'
        message TEXT NOT NULL,
        language TEXT DEFAULT 'en',     -- 'en', 'ta'
        is_demo_response INTEGER DEFAULT 1,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Device Registry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS device_registry (
        device_id TEXT PRIMARY KEY,
        device_name TEXT NOT NULL,
        device_type TEXT NOT NULL,
        location TEXT NOT NULL,
        ip_address TEXT DEFAULT '192.168.1.105',
        firmware_version TEXT DEFAULT 'v1.4.2-esp32',
        status TEXT DEFAULT 'ONLINE',   -- 'ONLINE', 'OFFLINE', 'STANDBY'
        source_type TEXT DEFAULT 'SIMULATED', -- 'SIMULATED', 'HARDWARE'
        aws_iot_synced INTEGER DEFAULT 0,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Field Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        field_name TEXT NOT NULL,
        crop_name TEXT NOT NULL,
        area_acres REAL NOT NULL,
        soil_type TEXT NOT NULL,
        irrigation_type TEXT NOT NULL,
        sowing_date TEXT NOT NULL,
        growth_stage TEXT NOT NULL,
        target_yield_t_per_ha REAL NOT NULL,
        health_status TEXT DEFAULT 'Healthy',
        notes TEXT
    )
    """)

    # Seed Default Data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_initial_data(cursor)

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def seed_initial_data(cursor):
    import hashlib
    # Demo User password 'farmer123' with PBKDF2 salt
    salt = "kisan_salt_2026"
    pw_hash = hashlib.pbkdf2_hmac('sha256', 'farmer123'.encode(), salt.encode(), 100000).hex()
    full_hash = f"{salt}${pw_hash}"

    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, farm_name, location, phone)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ('farmer@kisan.in', full_hash, 'Thiru R. Murugesan', 'Vaanavil Organic Farm', 'Pollachi, Coimbatore, Tamil Nadu', '+91 98421 78901'))

    # Seed Field Profile
    cursor.execute("""
    INSERT INTO field_profile (field_name, crop_name, area_acres, soil_type, irrigation_type, sowing_date, growth_stage, target_yield_t_per_ha, health_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'Plot 4A - North Valley Block',
        'Tomato',
        3.5,
        'Red Sandy Loam (pH 6.5)',
        'Automated Drip Irrigation',
        '2026-08-15',
        'Fruit Formation & Maturation',
        32.0,
        'Optimal Vegetative Growth',
        'Staking completed. Soil moisture target 30-45%. Regular calcium spray scheduled for blossom end rot prevention.'
    ))

    # Seed Devices
    cursor.execute("""
    INSERT INTO device_registry (device_id, device_name, device_type, location, ip_address, firmware_version, status, source_type, aws_iot_synced, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'ESP32-AGRI-01',
        'ESP32 Primary Field Node',
        'ESP32-WROOM-32D',
        'Plot 4A - Polyhouse & Drip Header',
        '192.168.1.108',
        'v1.4.2-firmware',
        'ONLINE',
        'SIMULATED',
        0,
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))

    cursor.execute("""
    INSERT INTO device_registry (device_id, device_name, device_type, location, ip_address, firmware_version, status, source_type, aws_iot_synced, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'ESP32-AGRI-02',
        'ESP32 Secondary Orchard Node',
        'ESP32-S3-DevKitC',
        'Plot 2B - Mango & Banana Border',
        '192.168.1.114',
        'v1.2.0-firmware',
        'ONLINE',
        'SIMULATED',
        0,
        (datetime.now() - timedelta(minutes=4)).strftime('%Y-%m-%d %H:%M:%S')
    ))

    # Seed 7 days of realistic sensor historical data
    now = datetime.now()
    base_moisture = 36.0
    for hour_offset in range(168, 0, -2):
        t = now - timedelta(hours=hour_offset)
        hour = t.hour

        # Diurnal temperature cycle: coolest around 5am (24C), peak around 2pm (34C)
        temp_cycle = 29.0 + 5.0 * (1.0 if 11 <= hour <= 15 else -1.0 if 3 <= hour <= 7 else 0.0)
        temp = round(temp_cycle + random.uniform(-1.2, 1.2), 1)

        # Humidity inverse of temperature
        humidity_cycle = 75.0 - (temp - 24.0) * 2.5
        humidity = round(max(38.0, min(92.0, humidity_cycle + random.uniform(-2.5, 2.5))), 1)

        # Light: 0 at night, up to 55,000 lux at noon
        if 6 <= hour <= 18:
            light = round(15000 + 40000 * (1.0 - abs(hour - 12) / 6.0) + random.uniform(-2000, 2000), 0)
            light = max(1200.0, light)
        else:
            light = round(random.uniform(0, 45), 0)

        # Soil moisture: decays gradually; bumps up if irrigation fired
        if hour == 7 or hour == 17:
            base_moisture = min(58.0, base_moisture + 18.0)
        else:
            base_moisture = max(24.0, base_moisture - random.uniform(0.3, 0.7))
        soil_m = round(base_moisture + random.uniform(-0.8, 0.8), 1)

        ph = round(6.5 + random.uniform(-0.15, 0.15), 2)
        rain = 1 if (hour_offset in [34, 35] and random.random() > 0.4) else 0

        cursor.execute("""
        INSERT INTO sensor_readings (device_id, soil_moisture, temperature, humidity, soil_ph, light_lux, rain_detected, nitrogen, phosphorus, potassium, is_simulated, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'ESP32-AGRI-01',
            soil_m,
            temp,
            humidity,
            ph,
            light,
            rain,
            round(135.0 + random.uniform(-5, 8), 1),
            round(42.0 + random.uniform(-2, 3), 1),
            round(180.0 + random.uniform(-7, 10), 1),
            1,
            t.strftime('%Y-%m-%d %H:%M:%S')
        ))

    # Seed Irrigation Logs
    cursor.execute("""
    INSERT INTO irrigation_logs (action, mode, triggered_by, moisture_level, duration_seconds, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ('PUMP_ON', 'AUTO', 'Moisture Threshold < 30%', 27.8, 720, 'Automatic drip cycle triggered for Tomato plot', (now - timedelta(hours=22)).strftime('%Y-%m-%d %H:%M:%S')))

    cursor.execute("""
    INSERT INTO irrigation_logs (action, mode, triggered_by, moisture_level, duration_seconds, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ('PUMP_OFF', 'AUTO', 'Target moisture reached (48%)', 48.5, 0, 'Auto cycle completed safely', (now - timedelta(hours=21, minutes=48)).strftime('%Y-%m-%d %H:%M:%S')))

    cursor.execute("""
    INSERT INTO irrigation_logs (action, mode, triggered_by, moisture_level, duration_seconds, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ('PUMP_ON', 'MANUAL', 'User Dashboard Override', 28.5, 480, 'Fertigation drip booster run', (now - timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S')))

    # Seed Recent Yield Prediction
    factors = json.dumps({
        "soil_moisture_impact": "Favorable (32-40% range maintains steady fruit turgor)",
        "temperature_impact": "Mild thermal stress detected during mid-day peak (34°C)",
        "ph_impact": "Optimal nutrient uptake range (pH 6.5)",
        "recommendation": "Mulching suggested to conserve root zone moisture"
    })
    cursor.execute("""
    INSERT INTO yield_predictions (user_id, crop, area_acres, soil_moisture, temperature, humidity, soil_ph, light_lux, historical_yield, predicted_yield_t_per_ha, total_production_tonnes, model_mode, factors_summary, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        1, 'Tomato', 3.5, 34.2, 31.5, 58.0, 6.5, 45200.0, 30.5, 33.4, 47.3,
        'Demo Mode (DNN Architecture)', factors, (now - timedelta(hours=14)).strftime('%Y-%m-%d %H:%M:%S')
    ))

    # Seed Welcome Assistant Message
    cursor.execute("""
    INSERT INTO chat_history (user_id, sender, message, language, is_demo_response, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        1, 'assistant',
        "Vanakkam! I am your GenAI Smart Farming Assistant. I am linked to your ESP32 IoT sensors and Crop Yield DNN model. How can I assist your field today?",
        'en', 1, (now - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')
    ))

if __name__ == "__main__":
    init_db()
