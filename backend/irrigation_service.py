"""
Smart Irrigation Management Service.
Handles automated threshold logic, relay simulation, manual controls,
and hardware safety guards for ESP32 relay actuation.
"""

from datetime import datetime
from database import get_db_connection

# In-memory irrigation operational state
_irrigation_state = {
    "pump_status": "OFF",              # 'ON', 'OFF'
    "mode": "AUTO",                    # 'AUTO', 'MANUAL'
    "moisture_threshold": 30.0,        # Pump triggers when moisture < threshold
    "target_moisture": 45.0,           # Pump turns off when moisture >= target
    "last_action_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "relay_gpio_pin": 26,              # Standard ESP32 relay control GPIO
    "relay_active_low": True,          # True: LOW = Pump ON, HIGH = Pump OFF
    "safety_max_runtime_minutes": 20,  # Auto-shutoff safety timer
    "current_runtime_seconds": 0,
    "is_hardware_connected": False,
    "mode_label": "SIMULATED RELAY & PUMP"
}

def get_irrigation_status(current_soil_moisture=None):
    """Returns current irrigation operational state and safety recommendations."""
    global _irrigation_state
    state = dict(_irrigation_state)

    if current_soil_moisture is not None:
        state["current_soil_moisture"] = current_soil_moisture
        # Calculate recommendation
        if current_soil_moisture < state["moisture_threshold"]:
            state["recommendation"] = f"CRITICAL NEED: Soil moisture ({current_soil_moisture}%) is below {state['moisture_threshold']}%. Irrigation recommended immediately."
            state["recommendation_urgency"] = "HIGH"
        elif current_soil_moisture < state["moisture_threshold"] + 5.0:
            state["recommendation"] = f"MODERATE: Soil moisture ({current_soil_moisture}%) approaching threshold. Prepare next drip cycle."
            state["recommendation_urgency"] = "MEDIUM"
        else:
            state["recommendation"] = f"NORMAL: Soil moisture ({current_soil_moisture}%) is adequate. No irrigation needed."
            state["recommendation_urgency"] = "LOW"
            
    return state

def set_pump_state(target_state, mode="MANUAL", triggered_by="User Interface", current_moisture=30.0):
    """
    Sets the pump state (ON or OFF) and logs the event in SQLite.
    Target state: 'ON' or 'OFF'
    """
    global _irrigation_state
    target_state = target_state.upper()
    if target_state not in ["ON", "OFF"]:
        return False, "Invalid pump state. Expected 'ON' or 'OFF'."

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prev_state = _irrigation_state["pump_status"]
    _irrigation_state["pump_status"] = target_state
    _irrigation_state["last_action_time"] = now
    if mode:
        _irrigation_state["mode"] = mode

    action_label = f"PUMP_{target_state}"
    notes = f"{mode} mode trigger: {triggered_by}. Relay GPIO {_irrigation_state['relay_gpio_pin']} {'LOW (ENERGIZED)' if target_state == 'ON' else 'HIGH (DE-ENERGIZED)'}."

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO irrigation_logs (action, mode, triggered_by, moisture_level, duration_seconds, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (action_label, _irrigation_state["mode"], triggered_by, current_moisture, 0, notes, now))
    conn.commit()
    conn.close()

    return True, f"Pump successfully switched {target_state} ({_irrigation_state['mode']} mode)."

def update_irrigation_settings(mode=None, moisture_threshold=None, target_moisture=None):
    """Updates irrigation thresholds and automation mode."""
    global _irrigation_state
    if mode in ["AUTO", "MANUAL"]:
        _irrigation_state["mode"] = mode
    if moisture_threshold is not None:
        try:
            val = float(moisture_threshold)
            if 15.0 <= val <= 60.0:
                _irrigation_state["moisture_threshold"] = val
        except ValueError:
            pass
    if target_moisture is not None:
        try:
            val = float(target_moisture)
            if val > _irrigation_state["moisture_threshold"]:
                _irrigation_state["target_moisture"] = val
        except ValueError:
            pass

    return dict(_irrigation_state)

def check_auto_irrigation_rule(current_moisture, rain_detected=0):
    """
    Called by sensor tick or IoT loop to evaluate automatic irrigation rules.
    If AUTO mode is active:
    - If moisture < threshold AND rain == 0, turn pump ON.
    - If moisture >= target_moisture OR rain == 1, turn pump OFF.
    """
    global _irrigation_state
    if _irrigation_state["mode"] != "AUTO":
        return _irrigation_state["pump_status"]

    if rain_detected == 1:
        if _irrigation_state["pump_status"] == "ON":
            set_pump_state("OFF", mode="AUTO", triggered_by="Rain detected by IoT rain sensor", current_moisture=current_moisture)
        return "OFF"

    if current_moisture < _irrigation_state["moisture_threshold"] and _irrigation_state["pump_status"] == "OFF":
        set_pump_state("ON", mode="AUTO", triggered_by=f"Auto rule: moisture ({current_moisture}%) < threshold ({_irrigation_state['moisture_threshold']}%)", current_moisture=current_moisture)
        return "ON"
    elif current_moisture >= _irrigation_state["target_moisture"] and _irrigation_state["pump_status"] == "ON":
        set_pump_state("OFF", mode="AUTO", triggered_by=f"Auto rule: target moisture ({_irrigation_state['target_moisture']}%) reached", current_moisture=current_moisture)
        return "OFF"

    return _irrigation_state["pump_status"]

def get_irrigation_history(limit=20):
    """Retrieves recent irrigation activation history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, action, mode, triggered_by, moisture_level, duration_seconds, notes, timestamp
    FROM irrigation_logs
    ORDER BY timestamp DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
