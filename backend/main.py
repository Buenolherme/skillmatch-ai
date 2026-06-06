import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .routes.extract_text import router as extract_text_router
except ImportError:
    from routes.extract_text import router as extract_text_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillMatch AI API",
    description="PDF resume text extraction API",
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
    }


app.include_router(extract_text_router)


if __name__ == "__main__":
    import uvicorn

    logger.info("Iniciando servidor...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
