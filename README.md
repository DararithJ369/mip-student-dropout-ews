# School Dropout Early Warning System (EWS) - SDG 4

An interactive web application and machine learning service designed to identify students at risk of dropping out from schools. This system utilizes advanced predictive modeling, feature engineering, and model explainability techniques to provide actionable insights for interventions, aligned with **United Nations Sustainable Development Goal 4 (Quality Education)**.

---

## 📊 Model Comparison and Selection

The project evaluates multiple resamplers and classifiers to address high class imbalance in the student survey dataset. In our cross-validation evaluations, we compared the following setups:

| Resampling | Classifier | Accuracy | Recall | F1-Score | ROC-AUC | Note |
|------------|------------|----------|--------|----------|---------|------|
| **SMOTE-ENN** | **LightGBM** | **0.777** | **0.591** | **0.414** ★ | **0.756** | **Best CV F1 & ROC-AUC** |
| SMOTE-ENN | XGBoost | 0.773 | 0.591 | 0.412 | 0.753 | |
| SMOTE | XGBoost | 0.863 | 0.352 | 0.404 | 0.720 | |
| SMOTE-ENN | GradBoost | 0.789 | 0.471 | 0.378 | 0.735 | |
| **SMOTE** | **SVM (SVC)** | **0.742** | **0.443** | **0.314** | **0.641** | Deployed Previously |
| Original | SVM | 0.773 | 0.476 | 0.354 | 0.678 | |
| Original | GradBoost | 0.879 | 0.205 | 0.308 | 0.696 | |

### Key Findings & Deployment Decision:
* **Deployment Choice**: **SMOTE + SVM (SVC)** is deployed in production. It offers a solid balance of accuracy (0.742), recall (0.443), and F1-score (0.314) on the resampled training space.
* **Tuning**: A tuned decision threshold of $\tau = 0.30$ is utilized in production to maximize recall and ensure early identification of at-risk profiles.
* **SHAP Explainability**: Integrates a SHAP explainer to provide real-time, explainable risk factors dynamically on the dashboard.

---

## 🛠️ Feature Engineering System

Before predictions, raw student survey inputs undergo dynamic feature engineering to construct multi-dimensional composite indices:
* **Attendance Quality**: $Attendance - Absence$
* **Engagement Score**: $Attendance + Monthly\ Average - Absence$
* **Socioeconomic Status (SES) Score**: $Family\ Income + Parental\ Education + External\ Support$
* **Support Index**: $Living\ With + External\ Support + Parental\ Education$
* **Commute Burden**: $Distance + Transport$

---

## 🚀 Getting Started

### 📋 Prerequisites
* **Python 3.11** or higher
* **Bun** or **Node.js**

---

### 1. ⚙️ Running the Backend (FastAPI ML Service)

Navigate to the backend directory:
```bash
cd EWS/backend
```

Set up and activate the virtual environment:
```bash
source ../../.venv/bin/activate
# Or install dependencies if starting fresh:
# pip install -r requirements.txt
```

Run the FastAPI application:
```bash
python3 run.py
```
The server will start at `http://127.0.0.1:8000`.

---

### 2. 💻 Running the Frontend (TanStack Start & React Web App)

Navigate to the frontend directory:
```bash
cd EWS
```

Install dependencies:
```bash
bun install
# Or: npm install
```

Start the development server:
```bash
bun run dev
# Or: npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📁 Repository Structure
```
student-dropout/
├── EWS/                      # Web Application Directory
│   ├── backend/              # FastAPI Backend
│   │   ├── app/
│   │   │   ├── models/       # SVM Classifier & SHAP Explainer
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── schemas/      # Pydantic input/output schemas
│   │   │   └── services/     # Preprocessing, Feature Engineering & SHAP service
│   │   ├── requirements.txt  # Python requirements
│   │   └── run.py            # Backend entrypoint
│   └── src/                  # React Frontend Code (TS & TanStack Router)
├── data/                     # Dataset storage
├── documents/                # Thesis chapters and reference papers
├── models/                   # Serialized Python Model Pickles (Restored SVM)
└── notebooks/                # Jupyter Notebooks detailing ML exploration
```
