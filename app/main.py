from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, subscriptions, companies, managers, admin, oauth
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="X8 Network SaaS Platform API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(oauth.router)
app.include_router(users.router)
app.include_router(companies.router)
app.include_router(subscriptions.router)
app.include_router(managers.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to X8 Network API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
