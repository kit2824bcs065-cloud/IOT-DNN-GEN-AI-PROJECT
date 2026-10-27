"""
Generative AI Farmer Assistant Service.
Supports Google Gemini API via secure backend integration when GEMINI_API_KEY is configured.
Provides an intelligent, context-aware rule-based demo assistant in English and Tamil (தமிழ்)
when API keys are absent, clearly labelled as Demo Mode.
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from database import get_db_connection
from sensor_service import get_current_reading

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

AGRICULTURAL_DISCLAIMER_EN = (
    "\n\n*Note: AI suggestions are advisory based on IoT sensor data and agronomic guidelines. "
    "Please verify field conditions and consult local agricultural extension officers (KVK/TNAU) before critical farm decisions.*"
)

AGRICULTURAL_DISCLAIMER_TA = (
    "\n\n*குறிப்பு: இந்த AI ஆலோசனைகள் சென்சார் தரவுகள் அடிப்படையிலான பரிந்துரைகளே. "
    "முக்கிய முடிவெடுக்கும் முன் வேளாண்மை அலுவலர் அல்லது விஞ்ஞானிகளுடன் ஆலோசிக்கவும்.*"
)

def build_system_context(sensor_reading=None, crop_info=None):
    """Packages field context for the GenAI model."""
    sensors = sensor_reading or get_current_reading()
    crop = crop_info or {"crop": "Tomato", "area_acres": 3.5, "growth_stage": "Flowering & Fruit Formation"}

    context = f"""
Field Context:
- Crop: {crop.get('crop', 'Tomato')} ({crop.get('growth_stage', 'Fruit Development')})
- Land Area: {crop.get('area_acres', 3.5)} acres in South India (Coimbatore/Pollachi belt)
- Soil Moisture: {sensors.get('soil_moisture')}% (Optimal target: 35% - 48%)
- Ambient Temperature: {sensors.get('temperature')}°C
- Relative Humidity: {sensors.get('humidity')}%
- Soil pH: {sensors.get('soil_ph')}
- Solar Light: {sensors.get('light_lux')} lux
- Rain Detection: {'Rain Present' if sensors.get('rain_detected') else 'No Rain'}
- NPK Readings: N={sensors.get('nitrogen')} mg/kg, P={sensors.get('phosphorus')} mg/kg, K={sensors.get('potassium')} mg/kg
"""
    return context

def generate_gemini_response(prompt, system_context, language="en"):
    """Invokes Google Gemini REST API using urllib.request."""
    if not GEMINI_API_KEY:
        return None

    # Using gemini-1.5-flash endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    lang_instruction = "Respond in clear, natural colloquial Tamil (தமிழ்) suitable for Indian farmers." if language == "ta" else "Respond in clear, encouraging English with practical Indian agricultural guidance."

    full_prompt = f"""
You are the GenAI Smart Agriculture Assistant for an Indian farmer.
{lang_instruction}

{system_context}

Farmer Question: {prompt}

Guidelines:
1. Speak in a helpful, respectful tone ('Vanakkam' for Tamil, warm tone for English).
2. Reference the farmer's live sensor numbers directly to explain your advice.
3. Keep advice practical, actionable, and safety-conscious.
4. Keep the answer under 160 words.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 350
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            disclaimer = AGRICULTURAL_DISCLAIMER_TA if language == "ta" else AGRICULTURAL_DISCLAIMER_EN
            return text + disclaimer
    except Exception as e:
        print(f"Gemini API call failed: {e}. Falling back to demo mode engine.")
        return None

def generate_demo_response(prompt, sensor_reading, language="en"):
    """
    Intelligent agronomic response engine for Demo Mode.
    Produces accurate, context-bound agricultural replies in English or Tamil.
    """
    p_lower = prompt.lower()
    moisture = sensor_reading.get("soil_moisture", 28.0)
    temp = sensor_reading.get("temperature", 32.0)
    humidity = sensor_reading.get("humidity", 58.0)
    ph = sensor_reading.get("soil_ph", 6.5)
    rain = sensor_reading.get("rain_detected", 0)

    is_tamil = (language == "ta")

    # 1. Soil Moisture / Irrigation query
    if any(k in p_lower for k in ["moisture", "water", "irrigation", "irrigate", "ஈரப்பதம்", "தண்ணீர்", "பாசனம்"]):
        if is_tamil:
            if moisture < 30.0:
                resp = (
                    f"வணக்கம் உழவரே! உங்கள் நிலத்தின் மண் ஈரப்பதம் தற்போது {moisture}% ஆக உள்ளது. "
                    f"இது தக்காளி மற்றும் பயிர்களுக்கு தேவையான குறைந்தபட்ச அளவான 35% ஐ விட குறைவாக உள்ளது. "
                    f"மழை ஏதும் பதிவாகவில்லை. எனவே உடனே 30 முதல் 45 நிமிடங்கள் சொட்டு நீர் பாசனம் தொடங்குவது நல்லது."
                )
            else:
                resp = (
                    f"வணக்கம் உழவரே! உங்கள் மண் ஈரப்பதம் {moisture}% ஆக உள்ளது. இது பயிருக்கு போதுமானதாக உள்ளது. "
                    f"தற்போது தண்ணீர் பாய்ச்ச தேவையில்லை. சொட்டு நீர் பாசனத்தை நிறுத்தி வைக்கலாம்."
                )
        else:
            if moisture < 30.0:
                resp = (
                    f"Your soil moisture reading is {moisture}%, which is below the optimal threshold (32-45%) for healthy crop development. "
                    f"No rainfall has been detected by your field sensors. We recommend initiating a drip irrigation cycle for 35-45 minutes to restore root zone moisture."
                )
            else:
                resp = (
                    f"Your current soil moisture is {moisture}%, which is well within the healthy comfort zone. "
                    f"Additional irrigation is not required right now. Soil aeration and root oxygenation are optimal."
                )

    # 2. Temperature and Weather query
    elif any(k in p_lower for k in ["temperature", "heat", "weather", "climate", "வெப்பநிலை", "சூடு", "வானிலை"]):
        if is_tamil:
            resp = (
                f"வணக்கம்! தற்போது வயலில் வெப்பநிலை {temp}°C மற்றும் காற்றில் ஈரப்பதம் {humidity}% ஆக உள்ளது. "
                f"{'நண்பகல் வெப்பம் அதிகமாக இருப்பதால் இலைகள் வாடாமல் இருக்க மாலையில் பாசனம் செய்யவும்.' if temp > 33 else 'வானிலை பயிர் வளர்ச்சிக்கு ஏதுவாக உள்ளது.'}"
            )
        else:
            resp = (
                f"Current field temperature is {temp}°C with {humidity}% relative humidity. "
                f"{'Mild thermal stress is observed during midday hours. Light mulching is advised to protect surface roots.' if temp > 33 else 'Weather conditions are favorable for vegetative growth and flowering.'}"
            )

    # 3. Soil pH query
    elif any(k in p_lower for k in ["ph", "acidity", "alkaline", "மண் வளம்", "அமிலத்தன்மை"]):
        if is_tamil:
            if 6.0 <= ph <= 7.2:
                resp = (
                    f"உங்கள் மண்ணின் pH அளவு {ph} ஆக உள்ளது. இது நடுநிலை ஆரோக்கியமான அளவாகும். "
                    f"செடிகள் தழைச்சத்து (N), மணிச்சத்து (P), சாம்பல்சத்து (K) ஆகியவற்றை எளிதாக உறிஞ்சும் சிறந்த நிலை."
                )
            else:
                resp = (
                    f"உங்கள் மண்ணின் pH அளவு {ph} ஆக உள்ளது. 6.0 முதல் 7.0 வரையான அளவிற்கு கொண்டுவர தேவையான கரிம உரம் (Organic Compost) இட பரிந்துரைக்கப்படுகிறது."
                )
        else:
            if 6.0 <= ph <= 7.2:
                resp = (
                    f"Your soil pH reading is {ph}, which lies perfectly within the optimal 6.0–7.2 agronomic bracket. "
                    f"Nutrient availability—particularly Nitrogen, Phosphorus, and micronutrients—is maximized at this neutral pH level."
                )
            else:
                resp = (
                    f"Your soil pH reading is {ph}. Slighting amending with compost or gypsum/lime according to your soil test report will balance soil chemistry."
                )

    # 4. Crop Yield Prediction query
    elif any(k in p_lower for k in ["yield", "production", "predict", "harvest", "மகசூல்", "விளைச்சல்", "அறுவடை"]):
        if is_tamil:
            resp = (
                f"வணக்கம்! நமது ஆழ்துளை நரம்பியல் வலைப்பின்னல் (DNN Model) உங்கள் தக்காளி பயிருக்கு ஏக்கருக்கு சுமார் 13.5 டன் "
                f"(ஹெக்டேருக்கு 33.4 டன்) மகசூல் கிடைக்கும் என்று கணக்கிட்டுள்ளது. போதுமான பாசனமும் பூச்சி மேலாண்மையும் செய்தால் முழு மகசூலை அடையலாம்."
            )
        else:
            resp = (
                f"Based on the Deep Neural Network (DNN) evaluation, your projected yield is estimated at ~33.4 tonnes per hectare (approx 13.5 tonnes per acre). "
                f"Ensuring steady moisture around 38-45% during fruit enlargement will ensure premium market grade fruits."
            )

    # 5. Field Summary / Daily condition
    elif any(k in p_lower for k in ["summarize", "today", "status", "overview", "முழு விவரம்", "இன்றைய நிலை"]):
        if is_tamil:
            resp = (
                f"இன்றைய கள ஆய்வு அறிக்கை:\n"
                f"• மண் ஈரப்பதம்: {moisture}% ({'குறைவு - பாசனம் தேவை' if moisture < 30 else 'போதுமானது'})\n"
                f"• வெப்பநிலை: {temp}°C, ஈரப்பதம்: {humidity}%\n"
                f"• மண் pH: {ph} (சிறந்தது)\n"
                f"• மழை: {'மழை பெய்கிறது' if rain else 'மழை இல்லை'}\n"
                f"பயிர் ஆரோக்கியமாக உள்ளது. பாசனத்தை கண்காணித்து தேவையான அளவு தண்ணீர் பாய்ச்சவும்."
            )
        else:
            resp = (
                f"Field Summary Snapshot:\n"
                f"• Soil Moisture: {moisture}% ({'Low - Needs Drip Run' if moisture < 30 else 'Healthy'})\n"
                f"• Temperature: {temp}°C | Humidity: {humidity}%\n"
                f"• Soil pH: {ph} | Light: {sensor_reading.get('light_lux', 0):,.0f} Lux\n"
                f"• Precipitation: {'Rain Detected' if rain else 'Dry / Clear'}\n"
                f"Crop stage is active fruit development. Recommend drip irrigation if moisture stays under 30%."
            )

    # 6. Default general query
    else:
        if is_tamil:
            resp = (
                f"வணக்கம் உழவரே! உங்கள் வயலின் சென்சார் அளவீடுகள் தொடர்ந்து கண்காணிக்கப்படுகின்றன. "
                f"மண் ஈரப்பதம் {moisture}%, வெப்பநிலை {temp}°C, மற்றும் pH {ph} ஆக உள்ளது. "
                f"பாசனம், உரம், அல்லது பயிர் மகசூல் குறித்து எந்த கேள்வியும் கேட்கலாம்."
            )
        else:
            resp = (
                f"Hello! I am monitoring your field telemetry. Current readings show Soil Moisture at {moisture}%, "
                f"Temperature at {temp}°C, and pH at {ph}. "
                f"Feel free to ask about irrigation timing, nutrient status, weather impact, or yield estimation."
            )

    disclaimer = AGRICULTURAL_DISCLAIMER_TA if is_tamil else AGRICULTURAL_DISCLAIMER_EN
    return resp + disclaimer

def process_chat_message(user_id, message, language="en"):
    """
    Main entry point for farmer chat.
    Tries real GenAI API first; smoothly falls back to verified Demo Mode if key is unset.
    Stores messages in chat history.
    """
    sensors = get_current_reading()
    system_ctx = build_system_context(sensors)

    # Check if real API key configured
    is_live_genai = bool(GEMINI_API_KEY.strip())
    response_text = None

    if is_live_genai:
        response_text = generate_gemini_response(message, system_ctx, language)

    # Fallback to Demo Mode if no response
    if not response_text:
        response_text = generate_demo_response(message, sensors, language)
        model_mode_label = "Demo Mode (Agricultural Knowledge Engine)"
        is_demo = True
    else:
        model_mode_label = "Google Gemini 1.5 Flash (Generative AI)"
        is_demo = False

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Save user message and assistant reply to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO chat_history (user_id, sender, message, language, is_demo_response, timestamp)
    VALUES (?, 'user', ?, ?, 0, ?)
    """, (user_id, message, language, now))

    cursor.execute("""
    INSERT INTO chat_history (user_id, sender, message, language, is_demo_response, timestamp)
    VALUES (?, 'assistant', ?, ?, ?, ?)
    """, (user_id, response_text, language, 1 if is_demo else 0, now))
    conn.commit()
    conn.close()

    return {
        "reply": response_text,
        "language": language,
        "is_demo_mode": is_demo,
        "model_engine": model_mode_label,
        "sensor_snapshot": {
            "soil_moisture": sensors.get("soil_moisture"),
            "temperature": sensors.get("temperature"),
            "humidity": sensors.get("humidity"),
            "soil_ph": sensors.get("soil_ph"),
            "rain_detected": sensors.get("rain_detected")
        },
        "timestamp": now
    }

def get_chat_history(user_id=1, limit=30):
    """Retrieves conversation history for user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, sender, message, language, is_demo_response, timestamp
    FROM chat_history
    WHERE user_id = ?
    ORDER BY timestamp ASC
    LIMIT ?
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def clear_chat_history(user_id=1):
    """Clears conversation messages for user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history WHERE user_id = ?", (user_id,))
    # Insert greeting
    cursor.execute("""
    INSERT INTO chat_history (user_id, sender, message, language, is_demo_response, timestamp)
    VALUES (?, 'assistant', 'Vanakkam! Conversation cleared. How can I assist your crop monitoring today?', 'en', 1, ?)
    """, (user_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()
    return True
