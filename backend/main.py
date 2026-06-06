import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKEND_ENV = Path(__file__).resolve().parent / ".env"
load_dotenv(BACKEND_ENV)
load_dotenv()

try:
    from .routes.analyze import router as analyze_router
except ImportError:
    from routes.analyze import router as analyze_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillMatch AI API",
    description="Resume analysis API powered by OpenAI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    logger.info("Health check realizado")
    return {
        "status": "ok",
        "version": "1.0.0",
        "openaiConfigured": bool(os.getenv("OPENAI_API_KEY")),
    }


app.include_router(analyze_router)


@app.on_event("startup")
async def startup_event():
    logger.info("=== SkillMatch AI API iniciada ===")
    logger.info("OPENAI_API_KEY configurada: %s", "Sim" if os.getenv("OPENAI_API_KEY") else "Nao")
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("AVISO: OPENAI_API_KEY nao configurada. As analises reais nao funcionarao.")


if __name__ == "__main__":
    import uvicorn

    logger.info("Iniciando servidor...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
