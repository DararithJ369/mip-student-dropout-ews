import joblib
import pandas as pd
import numpy as np

explainer = joblib.load("app/models/shap_explainer.pkl")

feature_labels = {
    "attendance_quality": "Low attendance quality",
    "engagement_score": "Low engagement score",
    "ses_score": "Low socioeconomic support",
    "support_index": "Weak support environment",
    "commute_burden": "High commute burden"
}



def explain_prediction(df):
    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df)

    shap_values = explainer(df)

    values = shap_values.values

    # handle classification output shape
    if values.ndim == 3:
        values = values[0, :, 1]  # class 1

    elif values.ndim == 2:
        values = values[0]

    feature_names = df.columns

    impact = list(zip(feature_names, values))

    impact = sorted(impact, key=lambda x: abs(float(x[1])), reverse=True)

    top_features = []

    for feature, value in impact[:3]:
        if float(value) > 0:
            top_features.append(feature_labels.get(feature, feature))

    return top_features