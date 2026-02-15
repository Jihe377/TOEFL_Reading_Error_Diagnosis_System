from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title= "TOEFL Reading Error Diagnosis System",
    description="TOEFL Reading Error Diagnosis System Backend API",
    version = "0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "TOEFL Reading Error Diagnosis System API",
        "docs": "/docs",
        "version": "0.1.0"        
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}