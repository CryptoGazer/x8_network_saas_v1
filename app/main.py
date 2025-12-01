from fastapi import FastAPI
from app.api.v1 import auth, users, subscriptions

app = FastAPI(title="x8-network")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subscriptions.router)