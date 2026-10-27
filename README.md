 IoT + DNN + GenAI Smart Farming System

An IoT, Deep Neural Network (DNN), and Generative AI based smart farming system designed to support crop monitoring, yield prediction, and intelligent irrigation management.

Project Overview

Agriculture plays an important role in food production. Farmers need reliable information about crop conditions, soil parameters, irrigation requirements, and expected crop yield to make better farming decisions.

This project aims to combine Internet of Things (IoT), Deep Neural Networks (DNN), and Generative AI to develop a smart farming platform.

The system includes a web dashboard, backend services, a crop yield prediction model, sensor data handling, irrigation management, and an AI-based farming assistant.

**Project Status:** Ongoing — features and hardware integration are under development.

 Problem Statement

Traditional farming methods often depend on manual observation and experience to monitor crop conditions and manage irrigation. Access to timely crop information and understandable agricultural guidance may also be limited.

This project aims to develop a technology-assisted farming system that can process sensor data, support crop yield prediction, provide AI-assisted farming guidance, and help farmers make informed decisions.

🎯 Objectives

* Monitor and manage agricultural sensor readings.
* Explore DNN-based crop yield prediction.
* Provide farming guidance using Generative AI.
* Support smart irrigation management.
* Present relevant information through a web dashboard.
* Develop a system that can be extended to real-world IoT hardware.

Key Features

 1. IoT Sensor Data Management

* Supports sensor data handling through backend services.
* Includes sample ESP32 telemetry data.
* Designed for future integration with physical sensors.

 2. DNN-Based Crop Yield Prediction

* Includes Python code for a crop yield prediction model.
* Provides model training and prediction-related components.
* Can be extended with suitable agricultural datasets.

 3. Generative AI Farming Assistant

* Includes a backend service for AI-assisted farming guidance.
* Designed to help users obtain understandable agricultural information.
* Requires appropriate API configuration when using an external AI service.

 4. Smart Irrigation Management

* Includes irrigation-related backend services.
* Provides a foundation for managing irrigation information.
* Automated physical pump control depends on hardware integration and testing.

 5. Web Dashboard

* Built using React and Vite.
* Includes pages for sensor monitoring, crop health, yield prediction, irrigation, reports, device management, and the GenAI assistant.

Technologies Used

| Component           | Technology                                               |
| ------------------- | -------------------------------------------------------- |
| Frontend            | React.js                                                 |
| Frontend Build Tool | Vite                                                     |
| Backend             | Python, Flask                                            |
| Database            | SQLite                                                   |
| Deep Learning       | Python, DNN                                              |
| Generative AI       | External GenAI API integration                           |
| IoT                 | ESP32 sample telemetry and sensor integration components |
| Version Control     | Git and GitHub                                           |

 System Architecture

The planned system follows this workflow:

1. **Data Collection:** Agricultural sensors or ESP32 devices provide relevant readings.
2. **Backend Processing:** The Flask backend processes incoming data and coordinates application services.
3. **Database Management:** SQLite stores supported application data.
4. **Yield Prediction:** The DNN model processes suitable input features to generate yield predictions.
5. **Generative AI:** The AI service provides farming guidance when correctly configured.
6. **Web Dashboard:** The React frontend presents information to the user.

```text
Agricultural Sensors / ESP32
            |
            v
      Flask Backend
            |
     +------+------+
     |      |      |
     v      v      v
  SQLite   DNN    GenAI
 Database Model   Service
     |      |      |
     +------+------+
            |
            v
      React Dashboard
```

*Note: The diagram represents the intended system architecture. Actual hardware connections and end-to-end functionality must be verified during implementation.*

## 📂 Project Structure

```text
IOT-DNN-GEN-AI-PROJECT/
│
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── genai_service.py
│   ├── irrigation_service.py
│   ├── prediction_service.py
│   ├── sensor_service.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── README.md
│   └── sample_esp32_payload.json
│
├── models/
│   ├── README.md
│   ├── crop_yield_dnn.py
│   ├── train_dnn.py
│   └── dnn_weights.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following software:

* Python 3
* Node.js and npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/kit2824bcs065-cloud/IOT-DNN-GEN-AI-PROJECT.git
```

Navigate to the project folder:

```bash
cd IOT-DNN-GEN-AI-PROJECT
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables according to `.env.example`. Use your own valid credentials locally where necessary. Never commit real API keys or passwords.

Start the Flask application:

```bash
python app.py
```

The backend port and API address depend on the application's configuration.

### 3. Set Up the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address displayed in the terminal.

**Important:** These are standard setup instructions. Actual startup commands, environment variables, ports, and dependencies should be verified against the current application files.

## 🔐 Security

* Do not commit API keys, passwords, access tokens, or private credentials.
* Keep real environment files out of version control.
* Use placeholder values in `.env.example`.
* Do not upload databases containing personal or sensitive information.
* Review authentication and database configuration before deploying the application publicly.

## 🚧 Current Limitations

* The project is under active development.
* Physical sensor integration requires hardware setup and testing.
* Automated irrigation requires compatible hardware and safety checks.
* Prediction quality depends on the training dataset and model validation.
* Generative AI functionality depends on service configuration and API availability.
* End-to-end functionality and deployment require separate testing.

## 🔮 Future Scope

* Integrate real soil moisture, temperature, humidity, pH, and other suitable agricultural sensors.
* Connect ESP32 hardware to the backend.
* Evaluate the DNN model using reliable agricultural datasets.
* Improve crop yield prediction and model evaluation.
* Provide multilingual farming guidance through text or voice.
* Add SMS alerts for farmers where appropriate.
* Integrate cloud storage and remote monitoring.
* Test safe, sensor-driven irrigation automation.
* Deploy the web application for remote access.

## 🌍 Applications

* Smart agriculture
* Crop monitoring
* Agricultural data analysis
* Crop yield estimation
* Irrigation management
* AI-assisted farming guidance
* IoT-based agricultural research

## 👨‍💻 Project Repository

GitHub: https://github.com/kit2824bcs065-cloud/IOT-DNN-GEN-AI-PROJECT

## 📄 License

No open-source license has been selected yet. All rights remain with the project owner unless a license is added.

## 🙌 Acknowledgement

This project is being developed as an engineering project exploring the integration of IoT, Deep Learning, and Generative AI for smart agriculture.

 Project Owner
Jayanth Prajin.N
BE Computer Science and Engineering
KIT – Kalaignar Karunanidhi Institute of Technology, Coimbatore
Role: Project Owner & Developer

GitHub: [@kit2824bcs065-cloud](https://github.com/kit2824bcs065-cloud)

