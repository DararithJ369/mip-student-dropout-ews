from pydantic import BaseModel
from typing import List


class PredictionOutput(BaseModel):

    dropout_probability: float

    prediction: int

    risk_level: str

    top_risk_factors: List[str]