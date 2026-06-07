import os
import unittest
from unittest.mock import AsyncMock, patch

from google.genai import errors
from httpx import ASGITransport, AsyncClient

from backend.main import app
from backend.services.gemini_analyzer import (
    GeminiAnalysisError,
    ResumeAnalysis,
    ResumeAnalysisPayload,
    _get_api_key,
    generate_resume_analysis,
)


SAMPLE_ANALYSIS = ResumeAnalysis(
    ats_score=82,
    compatibilidade=76,
    pontos_fortes=["Experiencia objetiva"],
    pontos_fracos=["Poucas metricas"],
    palavras_chave_faltantes=["Docker"],
    plano_de_melhoria=["Adicionar resultados mensuraveis"],
    model="gemini-2.5-flash",
)


class ApiRoutesTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.client = AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://testserver",
        )

    async def asyncTearDown(self) -> None:
        await self.client.aclose()

    @patch("backend.routes.extract_text.read_pdf_upload", new_callable=AsyncMock)
    async def test_extract_text_contract_is_preserved(
        self,
        read_pdf_upload: AsyncMock,
    ) -> None:
        read_pdf_upload.return_value = ("curriculo.pdf", "Texto do curriculo")

        response = await self.client.post(
            "/extract-text",
            files={"file": ("curriculo.pdf", b"%PDF-test", "application/pdf")},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "filename": "curriculo.pdf",
                "text": "Texto do curriculo",
                "characterCount": 18,
            },
        )

    @patch("backend.routes.analyze.generate_resume_analysis", new_callable=AsyncMock)
    @patch("backend.routes.analyze.read_pdf_upload", new_callable=AsyncMock)
    async def test_analyze_returns_structured_json(
        self,
        read_pdf_upload: AsyncMock,
        generate_resume_analysis: AsyncMock,
    ) -> None:
        read_pdf_upload.return_value = ("curriculo.pdf", "Texto do curriculo")
        generate_resume_analysis.return_value = SAMPLE_ANALYSIS

        response = await self.client.post(
            "/analyze",
            files={"file": ("curriculo.pdf", b"%PDF-test", "application/pdf")},
            data={"job_title": "Desenvolvedor Python"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), SAMPLE_ANALYSIS.model_dump())
        generate_resume_analysis.assert_awaited_once_with(
            "Texto do curriculo",
            job_description="",
            job_title="Desenvolvedor Python",
            level="",
            area="",
        )

    async def test_analyze_rejects_non_pdf(self) -> None:
        response = await self.client.post(
            "/analyze",
            files={"file": ("curriculo.txt", b"texto", "text/plain")},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["detail"], "Apenas arquivos PDF sao permitidos")

    @patch("backend.main.check_gemini_connection", new_callable=AsyncMock)
    @patch("backend.main.has_gemini_api_key", return_value=True)
    async def test_gemini_health_returns_requested_contract(
        self,
        _has_gemini_api_key,
        check_gemini_connection: AsyncMock,
    ) -> None:
        response = await self.client.get("/health/gemini")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "api_key": True,
                "model": "gemini-2.5-flash",
                "connection": True,
                "error": None,
            },
        )
        check_gemini_connection.assert_awaited_once()

    @patch("backend.main.check_gemini_connection", new_callable=AsyncMock)
    @patch("backend.main.has_gemini_api_key", return_value=True)
    async def test_gemini_health_preserves_original_error(
        self,
        _has_gemini_api_key,
        check_gemini_connection: AsyncMock,
    ) -> None:
        original_error = "400 INVALID_ARGUMENT. schema invalido"
        check_gemini_connection.side_effect = GeminiAnalysisError(
            original_error,
            status_code=400,
            provider_status="INVALID_ARGUMENT",
        )

        response = await self.client.get("/health/gemini")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                "api_key": True,
                "model": "gemini-2.5-flash",
                "connection": False,
                "error": original_error,
            },
        )


class GeminiConfigurationTest(unittest.TestCase):
    def test_missing_api_key_has_clear_error(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(GeminiAnalysisError) as context:
                _get_api_key()

        self.assertEqual(context.exception.status_code, 503)
        self.assertIn("GEMINI_API_KEY", str(context.exception))


class GeminiClientTest(unittest.IsolatedAsyncioTestCase):
    @patch("backend.services.gemini_analyzer.genai.Client")
    async def test_structured_gemini_response_is_validated(self, client_factory) -> None:
        client = client_factory.return_value
        client.aio.models.generate_content = AsyncMock(
            return_value=type(
                "GeminiResponse",
                (),
                {"parsed": SAMPLE_ANALYSIS.model_dump(), "text": None},
            )()
        )
        client.aio.aclose = AsyncMock()

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
            result = await generate_resume_analysis("Texto do curriculo")

        self.assertEqual(result, SAMPLE_ANALYSIS)
        client.aio.models.generate_content.assert_awaited_once()
        client.aio.aclose.assert_awaited_once()

    @patch("backend.services.gemini_analyzer.genai.Client")
    async def test_original_api_error_is_not_masked(self, client_factory) -> None:
        client = client_factory.return_value
        client.aio.models.generate_content = AsyncMock(
            side_effect=errors.ClientError(
                400,
                {
                    "error": {
                        "code": 400,
                        "message": "Schema invalido",
                        "status": "INVALID_ARGUMENT",
                    }
                },
            )
        )
        client.aio.aclose = AsyncMock()

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
            with self.assertRaises(GeminiAnalysisError) as context:
                await generate_resume_analysis("Texto do curriculo")

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.provider_status, "INVALID_ARGUMENT")
        self.assertIn("Schema invalido", str(context.exception))
        self.assertEqual(client.aio.models.generate_content.await_count, 1)
        client.aio.aclose.assert_awaited_once()

    @patch(
        "backend.services.gemini_analyzer.GEMINI_FALLBACK_MODELS",
        ("gemini-2.5-flash-lite", "gemini-2.0-flash"),
    )
    @patch("backend.services.gemini_analyzer.genai.Client")
    async def test_uses_fallback_after_503(self, client_factory) -> None:
        client = client_factory.return_value
        fallback_response = type(
            "GeminiResponse",
            (),
            {
                "parsed": {
                    key: value
                    for key, value in SAMPLE_ANALYSIS.model_dump().items()
                    if key != "model"
                },
                "text": None,
            },
        )()
        client.aio.models.generate_content = AsyncMock(
            side_effect=[
                errors.ServerError(
                    503,
                    {
                        "error": {
                            "code": 503,
                            "message": "High demand",
                            "status": "UNAVAILABLE",
                        }
                    },
                ),
                fallback_response,
            ]
        )
        client.aio.aclose = AsyncMock()

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
            result = await generate_resume_analysis("Texto do curriculo")

        calls = client.aio.models.generate_content.await_args_list
        self.assertEqual(calls[0].kwargs["model"], "gemini-2.5-flash")
        self.assertEqual(calls[1].kwargs["model"], "gemini-2.5-flash-lite")
        self.assertEqual(result.model, "gemini-2.5-flash-lite")
        client.aio.aclose.assert_awaited_once()

    @patch(
        "backend.services.gemini_analyzer.GEMINI_FALLBACK_MODELS",
        ("gemini-2.5-flash-lite",),
    )
    @patch("backend.services.gemini_analyzer.genai.Client")
    async def test_uses_fallback_after_timeout(self, client_factory) -> None:
        client = client_factory.return_value
        fallback_response = type(
            "GeminiResponse",
            (),
            {
                "parsed": {
                    key: value
                    for key, value in SAMPLE_ANALYSIS.model_dump().items()
                    if key != "model"
                },
                "text": None,
            },
        )()
        client.aio.models.generate_content = AsyncMock(
            side_effect=[TimeoutError(), fallback_response]
        )
        client.aio.aclose = AsyncMock()

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
            result = await generate_resume_analysis("Texto do curriculo")

        calls = client.aio.models.generate_content.await_args_list
        self.assertEqual(calls[0].kwargs["model"], "gemini-2.5-flash")
        self.assertEqual(calls[1].kwargs["model"], "gemini-2.5-flash-lite")
        self.assertEqual(result.model, "gemini-2.5-flash-lite")

    def test_response_schema_does_not_send_additional_properties(self) -> None:
        schema = ResumeAnalysisPayload.model_json_schema()

        self.assertNotIn("additionalProperties", schema)


if __name__ == "__main__":
    unittest.main()
