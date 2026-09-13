from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user, admin, qns
from models import Base
from database import engine

from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Warning: Could not connect or create database tables on startup:", e)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods = ["*"],
    allow_credentials = True,
    allow_headers = ["*"],
)


app.include_router(user.router)

app.include_router(qns.router)

app.include_router(admin.router)