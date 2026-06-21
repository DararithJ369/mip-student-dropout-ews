from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict_route import router as predict_router

app = FastAPI(title="Student Dropout Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)