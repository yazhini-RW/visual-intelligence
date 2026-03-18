from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from database.connection import engine
from database import models
from routers import analyze, analytics, reports
import os

load_dotenv()

models.Base.metadata.create_all(bind=engine)

os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/reports", exist_ok=True)

app = FastAPI(
    title="Visual Intelligence System",
    description="AI-powered image analysis platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/")
def root():
    return {"message": "Visual Intelligence System is running!"}