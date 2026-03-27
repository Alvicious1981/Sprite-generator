"""Entrypoint for running the image worker directly."""
import uvicorn
from src.settings import settings

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.port, reload=True)
