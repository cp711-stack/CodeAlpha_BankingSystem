from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import auth, customers, accounts, transactions, analytics, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FinVerse API is running")
    yield

app = FastAPI(
    title="FinVerse API",
    description="AI-Powered Digital Banking Platform API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {
        "app": "FinVerse API",
        "status": "online",
        "docs_url": "/docs"
    }
