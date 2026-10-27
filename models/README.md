# Deep Neural Network (DNN) Crop Yield Prediction Model

## 1. Architecture Overview
The crop yield estimation model is implemented as a 4-layer Multilayer Perceptron (MLP) Deep Neural Network:

- **Input Dimension**: 14 Features
  - 8 One-Hot Categorical Features: [Tomato, Rice, Wheat, Maize, Cotton, Groundnut, Banana, Sugarcane]
  - 6 Continuous Agronomic Features: [Soil Moisture (%), Ambient Temperature (°C), Relative Humidity (%), Soil pH, Solar Light (Lux), Historical Yield Benchmark (t/ha)]
- **Hidden Layer 1**: 64 Neurons, ReLU Activation, He Initialization
- **Hidden Layer 2**: 32 Neurons, ReLU Activation, He Initialization
- **Hidden Layer 3**: 16 Neurons, ReLU Activation, He Initialization
- **Output Layer**: 1 Neuron, Linear Activation (Normalized Yield index $\in [0, 1]$ mapped to crop-specific biological potential in tonnes/hectare)

## 2. Model Modes
The system explicitly distinguishes and labels the active model mode in the UI:
1. **Trained DNN Model**: Active when `models/dnn_weights.json` has been trained and loaded. Weights are trained using backpropagation on multi-variate agro-climatic curves.
2. **Demo Mode (Analytical DNN Baseline)**: Active if weights are deleted or unavailable, using botanical response curve regressions.

## 3. Retraining the Model
To retrain the neural network on fresh agricultural survey data:
```powershell
python models/train_dnn.py
```
This evaluates the model on a test split, prints the $R^2$ score and RMSE, and exports updated weights to `models/dnn_weights.json`.
