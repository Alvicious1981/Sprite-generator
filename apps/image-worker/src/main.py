"""Image Worker — FastAPI entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import compose_router
from .settings import settings

app = FastAPI(title="Sprite Generator — Image Worker", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compose_router)


@app.get("/health")
def health():
    return {"status": "ok"}
