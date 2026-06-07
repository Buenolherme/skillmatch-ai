import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from .routes.analyze import router as analyze_router
    from .routes.extract_text import router as extract_text_router
    from .services.gemini_analyzer import (
        GEMINI_MODEL,
        GEMINI_FALLBACK_MODELS,
        GEMINI_SDK_NAME,
        GEMINI_SDK_VERSION,
        GeminiAnalysisError,
        check_gemini_connection,
        has_gemini_api_key,
    )
except ImportError:
    from routes.analyze import router as analyze_router
    from routes.extract_text import router as extract_text_router
    from services.gemini_analyzer import (
        GEMINI_MODEL,
        GEMINI_FALLBACK_MODELS,
        GEMINI_SDK_NAME,
        GEMINI_SDK_VERSION,
        GeminiAnalysisError,
        check_gemini_connection,
        has_gemini_api_key,
    )

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
logger.info(
    "SDK Gemini carregado: sdk=%s versao=%s modelo_principal=%s fallbacks=%s",
    GEMINI_SDK_NAME,
    GEMINI_SDK_VERSION,
    GEMINI_MODEL,
    list(GEMINI_FALLBACK_MODELS),
)

app = FastAPI(
    title="SkillMatch AI API",
    description="PDF resume extraction and Gemini analysis API",
    version="1.1.0",
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
        "version": "1.1.0",
    }


@app.get("/health/gemini")
async def gemini_health_check():
    api_key_exists = has_gemini_api_key()

    if not api_key_exists:
        logger.error(
            "Health Gemini falhou: modelo=%s GEMINI_API_KEY ausente",
            GEMINI_MODEL,
        )
        return JSONResponse(
            status_code=503,
            content={
                "api_key": False,
                "model": GEMINI_MODEL,
                "connection": False,
                "error": "GEMINI_API_KEY nao configurada no backend.",
            },
        )

    try:
        await check_gemini_connection()
    except GeminiAnalysisError as exc:
        logger.error(
            "Health Gemini falhou: modelo=%s http_status=%s "
            "provider_status=%s mensagem_original=%s resposta_http=%s",
            GEMINI_MODEL,
            exc.status_code,
            exc.provider_status,
            exc,
            exc.response_body,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "api_key": True,
                "model": GEMINI_MODEL,
                "connection": False,
                "error": exc.safe_message,
            },
        )

    return {
        "api_key": True,
        "model": GEMINI_MODEL,
        "connection": True,
        "error": None,
    }


app.include_router(extract_text_router)
app.include_router(analyze_router)


if __name__ == "__main__":
    import uvicorn

    logger.info("Iniciando servidor...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
