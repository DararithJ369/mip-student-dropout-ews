from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict_route import router as predict_router
from app.routes.auth_route import router as auth_router
from app.routes.students_route import router as students_router
from app.routes.analytics_route import router as analytics_router
from app.routes.interventions_route import router as interventions_router
from app.utils.db import init_db

app = FastAPI(title="Student Dropout Predictor")

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(analytics_router)
app.include_router(interventions_router)