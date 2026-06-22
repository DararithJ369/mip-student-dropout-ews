from fastapi import APIRouter, HTTPException
from app.schemas.student_schema import StudentInput
from app.schemas.output_schema import PredictionOutput
from app.services.prediction_service import predict_dropout
from typing import Literal, get_args, get_origin

router = APIRouter()

FORM_ONLY_FIELDS = {
    "living_with", "distance", "transport", "attendance", "monthly_average",
    "absence", "parental_education", "family_income", "work_support", "external_support"
}

@router.get("/get-form") 
def get_form():
    form_structure = {}
    for field_name, field_info in StudentInput.model_fields.items():
        if field_name in FORM_ONLY_FIELDS and get_origin(field_info.annotation) is Literal:
            form_structure[field_name] = list(get_args(field_info.annotation))
    return form_structure


@router.post("/predict", response_model=PredictionOutput, summary="Predict student dropout risk")
def predict_endpoint(student_data: StudentInput):
    """
    Accepts validated student data and returns a dropout prediction.
    """
    try:
        # predict_dropout should accept a StudentInput instance
        result = predict_dropout(student_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")