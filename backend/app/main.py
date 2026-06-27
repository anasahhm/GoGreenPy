from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()  # must run before any module reads os.getenv
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, impact, admin, rewards

app = FastAPI(
    title="GoGreenPy API",
    description="Environmental Impact Analyzer API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(impact.router, prefix="/impact", tags=["Impact Analysis"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(rewards.router, prefix="/rewards", tags=["Rewards"])

@app.get("/")
async def root():
    return {"message": "Welcome to GoGreenPy API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}