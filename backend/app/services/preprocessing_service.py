import pandas as pd
import joblib

encoders = joblib.load("app/models/encoders.pkl")

def preprocess_input(data):
    # -------------------------
    # 1. Normalize input type
    # -------------------------
    if hasattr(data, "model_dump"):
        data = data.model_dump()
    elif hasattr(data, "dict"):
        data = data.dict()

    # already DataFrame
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient="records")[0]

    # batch input
    if isinstance(data, list):
        data = data[0]

    # force flat dict
    if not isinstance(data, dict):
        raise ValueError(f"Invalid input type: {type(data)}")

    # -------------------------
    # 2. build DataFrame safely
    # -------------------------
    df = pd.DataFrame([data])

    # -------------------------
    # 3. encode categoricals
    # -------------------------
    categorical_cols = [
        "gender",
        "living_with",
        "distance",
        "transport",
        "attendance",
        "monthly_average",
        "absence",
        "parental_education",
        "family_income",
        "work_support",
        "external_support",
    ]

    for col in categorical_cols:
        if col in df.columns:
            df[col] = encoders[col].transform(df[col].astype(str))
        else:
            raise KeyError(f"Missing column: {col}")

    return df