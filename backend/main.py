from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user, admin, qns, health
from models import Base
from database import engine
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from core.Limiter import limiter

from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Warning: Could not connect or create database tables on startup:", e)

app = FastAPI()

@app.middleware("http")
async def extract_login_email(request, call_next):

    if request.url.path == "/login/users" and request.method == "POST":
        try:
            body = await request.json()

            request.state.login_email = (
                body.get("email", "").lower().strip()
            )

        except Exception:
            request.state.login_email = None

    response = await call_next(request)
    return response

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

app.add_middleware(SlowAPIMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aptiforge-new.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user.router)

app.include_router(qns.router)

app.include_router(admin.router)

app.include_router(health.router)