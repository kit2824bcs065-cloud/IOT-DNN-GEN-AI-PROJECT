"""
Prediction service integrating the CropYieldDNN model with database persistence,
validation, and agronomic factor extraction.
"""

import os
import sys
import json
from datetime import datetime
from database import get_db_connection

# Add models directory to sys.path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "models"))
from crop_yield_dnn import CropYieldDNN, SUPPORTED_CROPS

_dnn_instance = CropYieldDNN()

def validate_prediction_inputs(data):
    """Ensures input parameters are agronomically bounded."""
    errors = []
    
    crop = data.get("crop", "Tomato")
    if crop not in SUPPORTED_CROPS:
        errors.append(f"Invalid crop '{crop}'. Supported crops: {', '.join(SUPPORTED_CROPS)}")
        
    try:
        moisture = float(data.get("soil_moisture", 0))
        if not (5.0 <= moisture <= 95.0):
            errors.append("Soil moisture must be between 5% and 95%.")
    except (ValueError, TypeError):
        errors.append("Soil moisture must be a numeric value.")
        
    try:
        temp = float(data.get("temperature", 0))
        if not (10.0 <= temp <= 50.0):
            errors.append("Temperature must be between 10°C and 50°C.")
    except (ValueError, TypeError):
        errors.append("Temperature must be a numeric value.")
        
    try:
        humidity = float(data.get("humidity", 0))
        if not (15.0 <= humidity <= 100.0):
            errors.append("Humidity must be between 15% and 100%.")
    except (ValueError, TypeError):
        errors.append("Humidity must be a numeric value.")
        
    try:
        ph = float(data.get("soil_ph", 0))
        if not (4.0 <= ph <= 9.0):
            errors.append("Soil pH must be between 4.0 and 9.0.")
    except (ValueError, TypeError):
        errors.append("Soil pH must be a numeric value.")
        
    try:
        area_acres = float(data.get("area_acres", 1.0))
        if area_acres <= 0.05 or area_acres > 500.0:
            errors.append("Land area must be between 0.1 and 500 acres.")
    except (ValueError, TypeError):
        errors.append("Land area must be a numeric value.")
        
    return errors

def predict_crop_yield(data, user_id=1):
    """
    Validates inputs, executes DNN model prediction,
    and stores historical prediction in SQLite.
    """
    errors = validate_prediction_inputs(data)
    if errors:
        return None, errors

    crop = data.get("crop", "Tomato")
    moisture = float(data.get("soil_moisture", 35.0))
    temp = float(data.get("temperature", 28.0))
    humidity = float(data.get("humidity", 60.0))
    ph = float(data.get("soil_ph", 6.5))
    light = float(data.get("light_lux", 40000.0))
    area_acres = float(data.get("area_acres", 2.0))
    hist_yield = float(data.get("historical_yield", 0.0)) if data.get("historical_yield") else None

    # Run DNN prediction
    prediction = _dnn_instance.predict(
        crop=crop,
        moisture=moisture,
        temp=temp,
        humidity=humidity,
        ph=ph,
        light=light,
        area_acres=area_acres,
        hist_yield=hist_yield
    )

    # Store in database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO yield_predictions (
        user_id, crop, area_acres, soil_moisture, temperature, humidity,
        soil_ph, light_lux, historical_yield, predicted_yield_t_per_ha,
        total_production_tonnes, model_mode, factors_summary, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, crop, area_acres, moisture, temp, humidity, ph, light,
        hist_yield, prediction["predicted_yield_t_per_ha"],
        prediction["total_production_tonnes"],
        prediction["model_mode"],
        json.dumps(prediction["limiting_factors"]),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()

    return prediction, None

def get_prediction_history(user_id=1, limit=15):
    """Returns past prediction reports for user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, crop, area_acres, soil_moisture, temperature, humidity, soil_ph,
           predicted_yield_t_per_ha, total_production_tonnes, model_mode, factors_summary, timestamp
    FROM yield_predictions
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        item = dict(r)
        try:
            item["factors_summary"] = json.loads(item["factors_summary"])
        except Exception:
            item["factors_summary"] = []
        results.append(item)
    return results
