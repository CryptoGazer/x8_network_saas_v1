from fastapi import FastAPI
from app.api.v1 import auth, users, subscriptions
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="x8-network")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subscriptions.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
