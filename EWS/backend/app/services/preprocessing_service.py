import pandas as pd

MAPPINGS = {
    "gender": {
        "Male": 0, "Female": 1, "Other": 2
    },
    "living_with": {
        "Both parents": 2, "Both Parents": 2,
        "One parent": 1, "Single Parent": 1,
        "Guardians/Relatives": 0
    },
    "distance": {
        "Less than 1km": 1,
        "between 1km-5km": 2, "1km - 5km": 2,
        "More than 5km": 3
    },
    "transport": {
        "Car": 0,
        "Motorbike": 1,
        "Bicycle": 2,
        "Walk": 3
    },
    "attendance": {
        "0 - 2 days": 0, "0-2 days": 0, "0 - 2 days / week": 0,
        "3 -4 days": 3, "3-4 days": 3, "3 - 4 days / week": 3,
        "5 - 6 days": 5, "5-6 days": 5, "5 - 6 days / week": 5
    },
    "absence": {
        "Never": 0,
        "Rarely": 1,
        "Sometimes": 2,
        "Often": 3
    },
    "parental_education": {
        "No education": 0,
        "Primary school": 1,
        "Secondary School": 2, "Secondary school": 2,
        "High School": 3, "High school": 3,
        "Higher education": 4
    },
    "family_income": {
        "Low": 0,
        "Medium": 1,
        "High": 2
    },
    "work_support": {
        "Yes": 1,
        "No": 0
    },
    "monthly_average": {
        "Less than 25.00": 0, "Low (< 25.00)": 0,
        "Between 25.00 to 40.00": 1, "Medium (25.00 - 40.00)": 1,
        "More than 40.00": 2, "High (> 40.00)": 2
    },
    "external_support": {
        "Yes": 1,
        "No": 0
    }
}

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
    # 3. map categoricals
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
            val = df[col].iloc[0]
            mapped_val = MAPPINGS[col].get(val)
            if mapped_val is None:
                # Try converting directly to int if it's already encoded or numeric
                try:
                    mapped_val = int(val)
                except (ValueError, TypeError):
                    mapped_val = 0
            df[col] = mapped_val
        else:
            raise KeyError(f"Missing column: {col}")

    return df