"""
Main Flask REST API Application for Smart Crop Monitoring.
Runs on port 5000 and powers all IoT telemetry, DNN predictions,
Smart Irrigation, and GenAI Farmer Assistant workflows.
"""

import os
import io
import csv
from flask import Flask, request, jsonify, make_response, Response
from datetime import datetime

# Initialize database
import database
database.init_db()

import auth
import sensor_service
import irrigation_service
import prediction_service
import genai_service

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "smart_crop_iot_dev_key_2026")

# CORS and preflight handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = make_response()
        res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return res

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

def get_authenticated_user_id():
    """Helper to extract and verify user token from Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        user_id = auth.verify_token(token)
        if user_id:
            return user_id
    # Default fallback demo user id
    return 1

# ================= AUTHENTICATION ROUTES =================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")
    full_name = data.get("full_name", "")
    farm_name = data.get("farm_name", "Kisan Agro Farm")
    location = data.get("location", "Coimbatore, Tamil Nadu")
    phone = data.get("phone", "+91 98421 00000")

    user_info, error = auth.register_user(email, password, full_name, farm_name, location, phone)
    if error:
        return jsonify({"success": False, "message": error}), 400

    return jsonify({"success": True, "user": user_info, "message": "Registration successful."}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")

    # Quick demo login button support
    if data.get("is_demo_login"):
        email = "farmer@kisan.in"
        password = "farmer123"

    user_info, error = auth.login_user(email, password)
    if error:
        return jsonify({"success": False, "message": error}), 401

    return jsonify({"success": True, "user": user_info, "message": "Login successful."}), 200

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "")
    new_password = data.get("new_password", "")

    success, message = auth.reset_password(email, new_password)
    if not success:
        return jsonify({"success": False, "message": message}), 400

    return jsonify({"success": True, "message": message}), 200

@app.route("/api/auth/me", methods=["GET"])
def me():
    user_id = get_authenticated_user_id()
    profile = auth.get_user_profile(user_id)
    if not profile:
        return jsonify({"success": False, "message": "User not found."}), 404
    return jsonify({"success": True, "user": profile}), 200

# ================= SENSOR ROUTES =================

@app.route("/api/sensors/live", methods=["GET"])
def get_live_sensors():
    reading = sensor_service.get_current_reading()
    # Check irrigation automation rule based on current reading
    irrigation_service.check_auto_irrigation_rule(reading["soil_moisture"], reading["rain_detected"])
    irrigation_info = irrigation_service.get_irrigation_status(reading["soil_moisture"])
    reading["irrigation"] = irrigation_info
    return jsonify({"success": True, "data": reading}), 200

@app.route("/api/sensors/tick", methods=["POST"])
def simulate_tick():
    """Advances simulated sensors by one time-step."""
    irrigation = irrigation_service.get_irrigation_status()
    is_pump_on = (irrigation["pump_status"] == "ON")
    updated_reading = sensor_service.simulate_sensor_tick(override_pump_running=is_pump_on)
    # Check automation trigger
    irrigation_service.check_auto_irrigation_rule(updated_reading["soil_moisture"], updated_reading["rain_detected"])
    updated_reading["irrigation"] = irrigation_service.get_irrigation_status(updated_reading["soil_moisture"])
    return jsonify({"success": True, "data": updated_reading}), 200

@app.route("/api/sensors/history", methods=["GET"])
def get_sensor_history():
    limit = request.args.get("limit", 48, type=int)
    days = request.args.get("days", 7, type=int)
    history = sensor_service.get_historical_sensor_data(limit=limit, days=days)
    return jsonify({"success": True, "data": history, "count": len(history)}), 200

@app.route("/api/sensors/telemetry", methods=["POST"])
def ingest_telemetry():
    """
    Dedicated endpoint for genuine ESP32 hardware node.
    Accepts JSON payload: {"device_id": "ESP32-AGRI-01", "soil_moisture": 32.4, ...}
    """
    payload = request.get_json()
    if not payload:
        return jsonify({"success": False, "message": "Empty payload"}), 400

    result = sensor_service.ingest_hardware_telemetry(payload)
    return jsonify({
        "success": True,
        "message": "Physical hardware telemetry ingested successfully.",
        "data": result
    }), 200

# ================= IRRIGATION ROUTES =================

@app.route("/api/irrigation/status", methods=["GET"])
def get_irrigation():
    curr = sensor_service.get_current_reading()
    status = irrigation_service.get_irrigation_status(curr["soil_moisture"])
    return jsonify({"success": True, "data": status}), 200

@app.route("/api/irrigation/pump", methods=["POST"])
def control_pump():
    data = request.get_json() or {}
    target_state = data.get("state", "OFF")
    mode = data.get("mode", "MANUAL")
    curr = sensor_service.get_current_reading()

    success, message = irrigation_service.set_pump_state(
        target_state=target_state,
        mode=mode,
        triggered_by="Dashboard User Action",
        current_moisture=curr["soil_moisture"]
    )
    if not success:
        return jsonify({"success": False, "message": message}), 400

    status = irrigation_service.get_irrigation_status(curr["soil_moisture"])
    return jsonify({"success": True, "message": message, "data": status}), 200

@app.route("/api/irrigation/settings", methods=["POST"])
def update_irrigation():
    data = request.get_json() or {}
    mode = data.get("mode")
    threshold = data.get("moisture_threshold")
    target = data.get("target_moisture")

    updated = irrigation_service.update_irrigation_settings(
        mode=mode,
        moisture_threshold=threshold,
        target_moisture=target
    )
    return jsonify({"success": True, "data": updated, "message": "Irrigation settings updated."}), 200

@app.route("/api/irrigation/history", methods=["GET"])
def get_irrigation_logs():
    limit = request.args.get("limit", 20, type=int)
    logs = irrigation_service.get_irrigation_history(limit=limit)
    return jsonify({"success": True, "data": logs}), 200

# ================= PREDICTION ROUTES =================

@app.route("/api/prediction/predict", methods=["POST"])
def predict_yield():
    data = request.get_json() or {}
    user_id = get_authenticated_user_id()
    result, errors = prediction_service.predict_crop_yield(data, user_id=user_id)
    if errors:
        return jsonify({"success": False, "errors": errors, "message": "Input validation failed."}), 400
    return jsonify({"success": True, "data": result}), 200

@app.route("/api/prediction/history", methods=["GET"])
def get_predictions_history():
    user_id = get_authenticated_user_id()
    history = prediction_service.get_prediction_history(user_id=user_id)
    return jsonify({"success": True, "data": history}), 200

# ================= GENAI FARMER ASSISTANT ROUTES =================

@app.route("/api/genai/chat", methods=["POST"])
def chat_genai():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    language = data.get("language", "en")
    user_id = get_authenticated_user_id()

    if not message:
        return jsonify({"success": False, "message": "Message cannot be empty."}), 400

    reply = genai_service.process_chat_message(user_id=user_id, message=message, language=language)
    return jsonify({"success": True, "data": reply}), 200

@app.route("/api/genai/history", methods=["GET"])
def chat_history():
    user_id = get_authenticated_user_id()
    history = genai_service.get_chat_history(user_id=user_id)
    return jsonify({"success": True, "data": history}), 200

@app.route("/api/genai/clear", methods=["POST"])
def clear_chat():
    user_id = get_authenticated_user_id()
    genai_service.clear_chat_history(user_id=user_id)
    return jsonify({"success": True, "message": "Chat conversation cleared."}), 200

# ================= CROP HEALTH & FIELD ROUTES =================

@app.route("/api/field/overview", methods=["GET"])
def get_field_overview():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM field_profile LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "message": "No field profile found."}), 404

    profile = dict(row)
    # Add live sensor telemetry to health overview
    reading = sensor_service.get_current_reading()
    profile["current_sensors"] = reading
    return jsonify({"success": True, "data": profile}), 200

@app.route("/api/field/update", methods=["POST"])
def update_field():
    data = request.get_json() or {}
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE field_profile
    SET field_name = ?, crop_name = ?, area_acres = ?, soil_type = ?,
        irrigation_type = ?, growth_stage = ?, target_yield_t_per_ha = ?, notes = ?
    WHERE id = 1
    """, (
        data.get("field_name", "Plot 4A - North Valley Block"),
        data.get("crop_name", "Tomato"),
        float(data.get("area_acres", 3.5)),
        data.get("soil_type", "Red Sandy Loam"),
        data.get("irrigation_type", "Automated Drip Irrigation"),
        data.get("growth_stage", "Fruit Formation & Maturation"),
        float(data.get("target_yield_t_per_ha", 32.0)),
        data.get("notes", "")
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Field information updated successfully."}), 200

# ================= DEVICE MANAGEMENT ROUTES =================

@app.route("/api/devices", methods=["GET"])
def get_devices():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM device_registry ORDER BY device_id ASC")
    rows = cursor.fetchall()
    conn.close()
    devices = [dict(r) for r in rows]
    return jsonify({"success": True, "data": devices}), 200

# ================= CLOUD & AWS ARCHITECTURE ROUTE =================

@app.route("/api/cloud/aws-status", methods=["GET"])
def get_aws_status():
    """
    Transparent Cloud / AWS IoT Core integration status.
    Modular design ready for AWS IoT MQTT broker connection.
    Does not pretend AWS is connected when not configured.
    """
    aws_configured = bool(os.environ.get("AWS_IOT_ENDPOINT"))
    return jsonify({
        "success": True,
        "aws_iot_configured": aws_configured,
        "status_label": "CONNECTED TO AWS IOT CORE" if aws_configured else "LOCAL REST PROTOCOL (AWS READY)",
        "broker_endpoint": os.environ.get("AWS_IOT_ENDPOINT", "iot.ap-south-1.amazonaws.com (Unconfigured)"),
        "shadow_topic": "smart-agri/device/ESP32-AGRI-01/shadow/update",
        "telemetry_topic": "smart-agri/telemetry/ESP32-AGRI-01",
        "cloud_architecture_ready": True,
        "architecture_summary": "Modular adapter pattern: Ingests via local HTTP REST now; swaps to AWS IoT Core MQTT subscription by setting AWS_IOT_ENDPOINT & certificate credentials."
    }), 200

# ================= CSV EXPORT ROUTE =================

@app.route("/api/reports/export-csv", methods=["GET"])
def export_csv():
    report_type = request.args.get("type", "sensors") # 'sensors' or 'predictions'
    conn = database.get_db_connection()
    cursor = conn.cursor()

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "predictions":
        cursor.execute("""
        SELECT id, crop, area_acres, soil_moisture, temperature, humidity, soil_ph,
               predicted_yield_t_per_ha, total_production_tonnes, model_mode, timestamp
        FROM yield_predictions
        ORDER BY timestamp DESC
        """)
        rows = cursor.fetchall()
        writer.writerow([
            "Prediction ID", "Crop", "Area (Acres)", "Soil Moisture (%)",
            "Temperature (°C)", "Humidity (%)", "Soil pH", "Yield (Tonnes/Ha)",
            "Total Production (Tonnes)", "Model Engine", "Timestamp"
        ])
        for r in rows:
            writer.writerow([
                r["id"], r["crop"], r["area_acres"], r["soil_moisture"],
                r["temperature"], r["humidity"], r["soil_ph"],
                r["predicted_yield_t_per_ha"], r["total_production_tonnes"],
                r["model_mode"], r["timestamp"]
            ])
        filename = f"yield_predictions_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    else:
        cursor.execute("""
        SELECT recorded_at, device_id, soil_moisture, temperature, humidity,
               soil_ph, light_lux, rain_detected, nitrogen, phosphorus, potassium, is_simulated
        FROM sensor_readings
        ORDER BY recorded_at DESC
        LIMIT 500
        """)
        rows = cursor.fetchall()
        writer.writerow([
            "Recorded At", "Device ID", "Soil Moisture (%)", "Temperature (°C)",
            "Humidity (%)", "Soil pH", "Light (Lux)", "Rain Detected",
            "Nitrogen (mg/kg)", "Phosphorus (mg/kg)", "Potassium (mg/kg)", "Data Source"
        ])
        for r in rows:
            writer.writerow([
                r["recorded_at"], r["device_id"], r["soil_moisture"],
                r["temperature"], r["humidity"], r["soil_ph"], r["light_lux"],
                "YES" if r["rain_detected"] == 1 else "NO",
                r["nitrogen"], r["phosphorus"], r["potassium"],
                "Simulated Demo" if r["is_simulated"] == 1 else "ESP32 Hardware"
            ])
        filename = f"iot_sensors_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    conn.close()

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    print("==============================================================")
    print(" Smart Crop Monitoring & Yield Prediction Backend Starting...")
    print(" Listening on http://localhost:5000")
    print("==============================================================")
    app.run(host="0.0.0.0", port=5000, debug=True)
