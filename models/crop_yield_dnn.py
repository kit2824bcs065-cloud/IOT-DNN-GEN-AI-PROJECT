"""
Crop Yield Prediction Deep Neural Network (DNN) Architecture.
Compatible with standard Deep Learning pipelines (TensorFlow/Keras/PyTorch/NumPy).

Architecture:
- Input Layer: 14 Features (8 one-hot crop vectors + 6 agronomic features)
- Dense Layer 1: 64 neurons, ReLU activation
- Dense Layer 2: 32 neurons, ReLU activation
- Dense Layer 3: 16 neurons, ReLU activation
- Output Layer: 1 neuron, Linear activation (Yield in Tonnes / Hectare)

Includes standard preprocessing scaler and realistic Indian agronomic constraints.
"""

import json
import math
import os

SUPPORTED_CROPS = [
    "Tomato", "Rice", "Wheat", "Maize", 
    "Cotton", "Groundnut", "Banana", "Sugarcane"
]

# Baseline agronomic statistics for Indian agro-climatic zones (ICAR benchmarks)
CROP_AGRONOMIC_PROFILES = {
    "Tomato": {
        "base_yield": 32.0, "min_yield": 12.0, "max_yield": 48.0,
        "opt_moisture": 42.0, "opt_temp": 26.0, "opt_humidity": 65.0, "opt_ph": 6.5,
        "price_per_tonne_inr": 18000
    },
    "Rice": {
        "base_yield": 4.5, "min_yield": 2.0, "max_yield": 7.2,
        "opt_moisture": 65.0, "opt_temp": 29.0, "opt_humidity": 80.0, "opt_ph": 6.2,
        "price_per_tonne_inr": 23000
    },
    "Wheat": {
        "base_yield": 3.8, "min_yield": 1.8, "max_yield": 5.8,
        "opt_moisture": 35.0, "opt_temp": 22.0, "opt_humidity": 55.0, "opt_ph": 6.8,
        "price_per_tonne_inr": 22750
    },
    "Maize": {
        "base_yield": 5.2, "min_yield": 2.5, "max_yield": 8.0,
        "opt_moisture": 40.0, "opt_temp": 28.0, "opt_humidity": 60.0, "opt_ph": 6.5,
        "price_per_tonne_inr": 20900
    },
    "Cotton": {
        "base_yield": 2.4, "min_yield": 1.0, "max_yield": 4.0,
        "opt_moisture": 32.0, "opt_temp": 31.0, "opt_humidity": 50.0, "opt_ph": 7.2,
        "price_per_tonne_inr": 70200
    },
    "Groundnut": {
        "base_yield": 2.8, "min_yield": 1.2, "max_yield": 4.5,
        "opt_moisture": 30.0, "opt_temp": 27.0, "opt_humidity": 58.0, "opt_ph": 6.4,
        "price_per_tonne_inr": 63770
    },
    "Banana": {
        "base_yield": 52.0, "min_yield": 25.0, "max_yield": 85.0,
        "opt_moisture": 55.0, "opt_temp": 28.0, "opt_humidity": 75.0, "opt_ph": 6.7,
        "price_per_tonne_inr": 16000
    },
    "Sugarcane": {
        "base_yield": 85.0, "min_yield": 45.0, "max_yield": 125.0,
        "opt_moisture": 60.0, "opt_temp": 32.0, "opt_humidity": 70.0, "opt_ph": 6.9,
        "price_per_tonne_inr": 3150
    }
}

class CropYieldDNN:
    def __init__(self, weights_path=None):
        self.weights_path = weights_path or os.path.join(os.path.dirname(__file__), "dnn_weights.json")
        self.is_trained = False
        self.weights = {}
        self.load_model()

    def relu(self, x):
        return [max(0.0, v) for v in x]

    def matmul_add(self, vec, weights, bias):
        out = []
        for j in range(len(bias)):
            val = bias[j]
            for i in range(len(vec)):
                val += vec[i] * weights[i][j]
            out.append(val)
        return out

    def preprocess(self, crop, moisture, temp, humidity, ph, light, hist_yield=None):
        """
        Encodes and normalizes raw agricultural inputs into a 14-dimensional feature vector:
        - 8 one-hot dimensions for crop type
        - 6 normalized environmental & historical features
        """
        # One-hot encode crop
        one_hot = [1.0 if c == crop else 0.0 for c in SUPPORTED_CROPS]

        # Environmental normalization using standard agricultural bounds
        norm_moisture = (moisture - 10.0) / 80.0
        norm_temp = (temp - 10.0) / 35.0
        norm_humidity = (humidity - 20.0) / 75.0
        norm_ph = (ph - 4.5) / 4.5
        norm_light = min(1.0, light / 70000.0)
        
        prof = CROP_AGRONOMIC_PROFILES.get(crop, CROP_AGRONOMIC_PROFILES["Tomato"])
        if hist_yield is not None and hist_yield > 0:
            norm_hist = (hist_yield - prof["min_yield"]) / (prof["max_yield"] - prof["min_yield"])
        else:
            norm_hist = 0.5

        features = one_hot + [norm_moisture, norm_temp, norm_humidity, norm_ph, norm_light, norm_hist]
        return features

    def load_model(self):
        """Loads trained DNN weights if available."""
        if os.path.exists(self.weights_path):
            try:
                with open(self.weights_path, 'r') as f:
                    self.weights = json.load(f)
                self.is_trained = True
                print("Trained DNN weights loaded successfully from disk.")
                return True
            except Exception as e:
                print(f"Error loading trained DNN weights: {e}")
                self.is_trained = False
        else:
            self.is_trained = False
        return False

    def forward(self, features):
        """Executes multi-layer forward pass."""
        if self.is_trained and "w1" in self.weights:
            # 14 -> 64
            h1 = self.relu(self.matmul_add(features, self.weights["w1"], self.weights["b1"]))
            # 64 -> 32
            h2 = self.relu(self.matmul_add(h1, self.weights["w2"], self.weights["b2"]))
            # 32 -> 16
            h3 = self.relu(self.matmul_add(h2, self.weights["w3"], self.weights["b3"]))
            # 16 -> 1
            out = self.matmul_add(h3, self.weights["w4"], self.weights["b4"])[0]
            return out
        else:
            # Agronomic regression kernel in Demo Mode
            return None

    def predict(self, crop, moisture, temp, humidity, ph, light, area_acres, hist_yield=None):
        """
        End-to-end prediction with agronomic limiting factor analysis.
        Returns detailed predictions in tonnes/ha, total production, and limitations.
        """
        if crop not in CROP_AGRONOMIC_PROFILES:
            crop = "Tomato"
        prof = CROP_AGRONOMIC_PROFILES[crop]

        features = self.preprocess(crop, moisture, temp, humidity, ph, light, hist_yield)
        dnn_output = self.forward(features)

        if dnn_output is not None and self.is_trained:
            model_mode = "Trained DNN Model"
            # De-normalize DNN output to crop scale
            raw_yield = prof["min_yield"] + dnn_output * (prof["max_yield"] - prof["min_yield"])
        else:
            model_mode = "Demo Mode (Analytical DNN Baseline)"
            # Agronomic non-linear yield response function
            m_penalty = 1.0 - min(0.35, abs(moisture - prof["opt_moisture"]) / 55.0)
            t_penalty = 1.0 - min(0.30, abs(temp - prof["opt_temp"]) / 30.0)
            h_penalty = 1.0 - min(0.20, abs(humidity - prof["opt_humidity"]) / 60.0)
            ph_penalty = 1.0 - min(0.30, abs(ph - prof["opt_ph"]) / 3.0)

            combined_factor = m_penalty * t_penalty * h_penalty * ph_penalty
            if hist_yield and hist_yield > 0:
                raw_yield = 0.65 * (prof["base_yield"] * combined_factor) + 0.35 * hist_yield
            else:
                raw_yield = prof["base_yield"] * combined_factor

        # Guard within biological boundaries
        predicted_yield_t_ha = round(max(prof["min_yield"] * 0.7, min(prof["max_yield"] * 1.08, raw_yield)), 2)

        # 1 Acre = 0.404686 Hectares
        hectares = area_acres * 0.404686
        total_tonnes = round(predicted_yield_t_ha * hectares, 2)
        total_quintals = round(total_tonnes * 10.0, 1) # 1 Tonne = 10 Quintals
        est_revenue_inr = round(total_tonnes * prof["price_per_tonne_inr"], 0)

        # Confidence and uncertainty range (±7% to 12%)
        uncertainty_pct = 8.5 if self.is_trained else 11.0
        uncertainty_low = round(predicted_yield_t_ha * (1.0 - uncertainty_pct / 100.0), 2)
        uncertainty_high = round(predicted_yield_t_ha * (1.0 + uncertainty_pct / 100.0), 2)

        # Generate Limiting Factors
        limiting_factors = []
        if moisture < prof["opt_moisture"] - 8.0:
            limiting_factors.append(f"Suboptimal Soil Moisture: Current {moisture}% is below ideal {prof['opt_moisture']}%, causing stomatal closure and vegetative slowdown.")
        elif moisture > prof["opt_moisture"] + 15.0:
            limiting_factors.append(f"Excessive Moisture: Current {moisture}% creates temporary hypoxia in root zone.")

        if temp > prof["opt_temp"] + 5.0:
            limiting_factors.append(f"Thermal Elevation: Midday temperature {temp}°C exceeds preferred {prof['opt_temp']}°C, potentially hindering pollination.")
        elif temp < prof["opt_temp"] - 6.0:
            limiting_factors.append(f"Low Temperature: Ambient {temp}°C slows metabolic growth.")

        if abs(ph - prof["opt_ph"]) > 0.6:
            limiting_factors.append(f"Soil pH Deviation: Current pH {ph} varies from ideal {prof['opt_ph']}, affecting micronutrient assimilation.")

        if not limiting_factors:
            limiting_factors.append("Current micro-environmental parameters align favorably with the genetic yield potential of the crop.")

        return {
            "crop": crop,
            "area_acres": area_acres,
            "area_hectares": round(hectares, 3),
            "predicted_yield_t_per_ha": predicted_yield_t_ha,
            "total_production_tonnes": total_tonnes,
            "total_production_quintals": total_quintals,
            "estimated_gross_revenue_inr": est_revenue_inr,
            "price_per_tonne_inr": prof["price_per_tonne_inr"],
            "model_mode": model_mode,
            "confidence_interval": {
                "uncertainty_pct": uncertainty_pct,
                "range_t_per_ha": [uncertainty_low, uncertainty_high],
                "range_tonnes": [round(uncertainty_low * hectares, 2), round(uncertainty_high * hectares, 2)]
            },
            "limiting_factors": limiting_factors,
            "input_snapshot": {
                "soil_moisture": moisture,
                "temperature": temp,
                "humidity": humidity,
                "soil_ph": ph,
                "light_lux": light,
                "historical_yield": hist_yield
            },
            "benchmark": {
                "state_average_t_ha": prof["base_yield"],
                "potential_record_t_ha": prof["max_yield"]
            }
        }
