import joblib
import pandas as pd

from app.services.shap_service import explain_prediction
from app.services.preprocessing_service import preprocess_input
from app.services.feature_engineering_service import engineer_features

pipe = joblib.load("app/models/dropout_pipeline.pkl")

def predict_dropout(data):

    # 1. ensure Pydantic / dict / DataFrame -> DataFrame
    if hasattr(data, "model_dump"):
        data = data.model_dump()
    elif hasattr(data, "dict"):
        data = data.dict()

    if isinstance(data, pd.DataFrame):
        df = data.copy()
    elif isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame([data])

    # 2. remove unused raw columns
    if "province" in df.columns:
        df = df.drop(columns=["province"])

    # 3. preprocessing
    processed_df = preprocess_input(df)

    # 4. feature engineering
    engineered_df = engineer_features(processed_df)

    # 5. ALIGN features ONLY NOW (critical fix)
    engineered_df = engineered_df.reindex(columns=pipe.feature_names_in_, fill_value=0)

    # 6. prediction
    probability = pipe.predict_proba(engineered_df)[0][1]

    prediction = int(probability >= 0.30)

    # 7. risk level
    if probability >= 0.7:
        risk_level = "High Risk"
    elif probability >= 0.30:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    # 8. SHAP explanation (must use scaled df)
    scaler = pipe.named_steps['scaler']
    scaled_features = scaler.transform(engineered_df)
    scaled_df = pd.DataFrame(scaled_features, columns=engineered_df.columns)
    explanations = explain_prediction(scaled_df)

    return {
        "dropout_probability": round(float(probability), 3),
        "prediction": prediction,
        "risk_level": risk_level,
        "top_risk_factors": explanations
    }