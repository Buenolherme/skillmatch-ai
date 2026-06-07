import os
import unittest
from unittest.mock import AsyncMock, patch

from google.genai import errors
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from backend.main import app
from backend.services.gemini_analyzer import (
    ATS_SYSTEM_INSTRUCTION,
    AtsCriteria,
    CriterionAssessment,
    EvolutionPlanItem,
    GeminiAnalysisError,
    RealProofDetection,
    RecruiterPerspective,
    ResumeAnalysis,
    ResumeAnalysisPayload,
    _build_prompt,
    _calibrate_recruiter_risk,
    _calibrate_scores,
    _get_api_key,
    _normalize_evolution_plan,
    _normalize_proof_detector,
    generate_resume_analysis,
)

SAMPLE_CRITERIA = AtsCriteria(
    compatibilidade_vaga=CriterionAssessment(
        pontuacao=76,
        aplicavel=True,
        justificativa="Python foi comprovado, mas Docker nao aparece no curriculo.",
        evidencias=["Python em experiencia profissional", "Docker ausente"],
    ),
    habilidades_tecnicas=CriterionAssessment(
        pontuacao=88,
        aplicavel=True,
        justificativa="O curriculo comprova Python, FastAPI e bancos relacionais.",
        evidencias=["Python", "FastAPI", "PostgreSQL"],
    ),
    experiencias=CriterionAssessment(
        pontuacao=84,
        aplicavel=True,
        justificativa="A experiencia e aderente, mas apresenta poucas metricas.",
        evidencias=["Desenvolvimento de APIs", "Tres anos de experiencia"],
    ),
    projetos=CriterionAssessment(
        pontuacao=80,
        aplicavel=True,
        justificativa="Os projetos usam tecnologias relacionadas ao cargo.",
        evidencias=["API de gestao em FastAPI"],
    ),
    formacao=CriterionAssessment(
        pontuacao=83,
        aplicavel=True,
        justificativa="A formacao em tecnologia e compativel com a vaga.",
        evidencias=["Graduacao em Sistemas de Informacao"],
    ),
    certificacoes=CriterionAssessment(
        pontuacao=0,
        aplicavel=False,
        justificativa="A vaga nao exige certificacoes especificas.",
        evidencias=[],
    ),
)

SAMPLE_ANALYSIS = ResumeAnalysis(
    ats_score=82,
    compatibilidade=76,
    requisitos_obrigatorios_atendidos=["Python", "FastAPI"],
    requisitos_obrigatorios_ausentes=[],
    justificativa_ats=(
        "O score reflete boa evidencia em habilidades tecnicas e experiencia, "
        "com perda pela ausencia de Docker e de resultados mensuraveis."
    ),
    justificativa_compatibilidade=(
        "Python e FastAPI atendem a vaga, enquanto Docker nao possui evidencia."
    ),
    criterios=SAMPLE_CRITERIA,
    detector_prova_real=[
        RealProofDetection(
            habilidade="Docker",
            status="sem_comprovacao",
            risco="medio",
            motivo=(
                "Docker aparece na lista de habilidades, mas nao esta ligado "
                "a experiencia, projeto, curso ou certificacao."
            ),
            como_comprovar=(
                "Adicionar um projeto real conteinerizado e informar o "
                "repositorio com a funcao exercida."
            ),
        )
    ],
    visao_recrutador=RecruiterPerspective(
        resumo=(
            "O perfil apresenta experiencia relevante em Python e FastAPI, "
            "mas ainda precisa comprovar Docker e resultados mensuraveis."
        ),
        pontos_de_atencao=[
            "Docker nao possui evidencia em experiencia ou projeto.",
            "As experiencias apresentam poucas metricas de impacto.",
        ],
        pontos_positivos=[
            "Python e FastAPI aparecem associados a experiencia profissional.",
            "A formacao em tecnologia esta alinhada ao cargo.",
        ],
        perguntas_provaveis=[
            "Como Python e FastAPI foram usados no sistema citado?",
            "Voce ja conteinerizou alguma aplicacao com Docker?",
        ],
        risco_de_rejeicao="medio",
    ),
    plano_evolucao=[
        EvolutionPlanItem(
            prioridade="alta",
            acao=(
                "Adicionar um projeto Docker real com repositorio e descricao "
                "do processo de conteinerizacao."
            ),
            impacto_estimado="+8 pontos ATS",
            prazo_sugerido="7 dias",
        ),
        EvolutionPlanItem(
            prioridade="media",
            acao="Adicionar metricas verdadeiras nas experiencias profissionais.",
            impacto_estimado="+4 pontos ATS",
            prazo_sugerido="2 dias",
        ),
    ],
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

        self.assertEqual(result.model, SAMPLE_ANALYSIS.model)
        self.assertEqual(result.ats_score, 82)
        self.assertEqual(result.compatibilidade, 76)
        self.assertEqual(result.criterios, SAMPLE_CRITERIA)
        client.aio.models.generate_content.assert_awaited_once()
        config = client.aio.models.generate_content.await_args.kwargs["config"]
        self.assertEqual(config.system_instruction, ATS_SYSTEM_INSTRUCTION)
        self.assertEqual(config.temperature, 0.1)
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
        ("gemini-2.5-flash-lite", "gemini-2.0-flash"),
    )
    @patch("backend.services.gemini_analyzer.genai.Client")
    async def test_uses_fallback_chain_after_429_and_503(
        self,
        client_factory,
    ) -> None:
        client = client_factory.return_value
        success_response = type(
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
                errors.ClientError(
                    429,
                    {
                        "error": {
                            "code": 429,
                            "message": "Quota exceeded",
                            "status": "RESOURCE_EXHAUSTED",
                        }
                    },
                ),
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
                success_response,
            ]
        )
        client.aio.aclose = AsyncMock()

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
            with self.assertLogs(
                "backend.services.gemini_analyzer",
                level="INFO",
            ) as captured_logs:
                result = await generate_resume_analysis("Texto do curriculo")

        models = [
            call.kwargs["model"]
            for call in client.aio.models.generate_content.await_args_list
        ]
        self.assertEqual(
            models,
            [
                "gemini-2.5-flash",
                "gemini-2.5-flash-lite",
                "gemini-2.0-flash",
            ],
        )
        self.assertEqual(result.model, "gemini-2.0-flash")
        self.assertTrue(
            any(
                "modelo_usado=gemini-2.0-flash" in message
                for message in captured_logs.output
            )
        )
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

    def test_proof_detector_rejects_invalid_status_and_risk(self) -> None:
        with self.assertRaises(ValidationError):
            RealProofDetection(
                habilidade="Docker",
                status="comprovada",
                risco="critico",
                motivo="Valor invalido para teste.",
                como_comprovar="Valor invalido para teste.",
            )

    def test_recruiter_view_rejects_invalid_risk(self) -> None:
        with self.assertRaises(ValidationError):
            RecruiterPerspective(
                resumo="Resumo para teste.",
                pontos_de_atencao=[],
                pontos_positivos=[],
                perguntas_provaveis=[],
                risco_de_rejeicao="critico",
            )

    def test_recruiter_view_normalizes_risk(self) -> None:
        perspective = RecruiterPerspective(
            resumo="Resumo para teste.",
            pontos_de_atencao=[],
            pontos_positivos=[],
            perguntas_provaveis=[],
            risco_de_rejeicao="Médio",
        )

        self.assertEqual(perspective.risco_de_rejeicao, "medio")

    def test_evolution_plan_normalizes_priority_and_impact(self) -> None:
        item = EvolutionPlanItem(
            prioridade="Média",
            acao="Detalhar projeto real.",
            impacto_estimado="Aumento estimado de 14 pontos",
            prazo_sugerido="3 dias",
        )

        self.assertEqual(item.prioridade, "media")
        self.assertEqual(item.impacto_estimado, "+10 pontos ATS")

    def test_prompt_uses_detailed_ats_rubric(self) -> None:
        prompt = _build_prompt(
            "Python, FastAPI e PostgreSQL",
            "Obrigatorio Python e Docker",
            "Desenvolvedor Backend",
            "Junior",
            "Tecnologia",
        )

        self.assertIn("compatibilidade_vaga: 30%", prompt)
        self.assertIn("habilidades_tecnicas: 25%", prompt)
        self.assertIn("experiencias: 20%", prompt)
        self.assertIn("projetos: 10%", prompt)
        self.assertIn("formacao: 10%", prompt)
        self.assertIn("certificacoes: 5%", prompt)
        self.assertIn("requisito declarado como obrigatorio", prompt)
        self.assertIn("DETECTOR DE PROVA REAL", prompt)
        self.assertIn("somente habilidades citadas no curriculo", prompt)
        self.assertIn("Audite todas as habilidades", prompt)
        self.assertIn("sem_comprovacao", prompt)
        self.assertIn("VISAO DO RECRUTADOR", prompt)
        self.assertIn("Nao bajule", prompt)
        self.assertIn("PLANO DE EVOLUCAO", prompt)
        self.assertIn('formato "+N pontos ATS"', prompt)
        self.assertIn("Obrigatorio Python e Docker", prompt)

    def test_proof_detector_completes_listed_skills_without_evidence(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={"detector_prova_real": []}
        )
        resume = """
Habilidades: Python, Docker, AWS, Git.
Experiencia: desenvolvimento de APIs com Python.
"""
        job = "Obrigatorio: Python e Docker. Desejavel: AWS."

        normalized = _normalize_proof_detector(payload, resume, job)

        detector_by_skill = {
            item.habilidade: item for item in normalized.detector_prova_real
        }
        self.assertNotIn("Python", detector_by_skill)
        self.assertEqual(detector_by_skill["Docker"].status, "sem_comprovacao")
        self.assertEqual(detector_by_skill["Docker"].risco, "alto")
        self.assertEqual(detector_by_skill["AWS"].risco, "medio")
        self.assertEqual(detector_by_skill["Git"].risco, "baixo")

    def test_proof_detector_removes_hallucinated_skill(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={
                "detector_prova_real": [
                    RealProofDetection(
                        habilidade="Kubernetes",
                        status="sem_comprovacao",
                        risco="alto",
                        motivo="Nao comprovada.",
                        como_comprovar="Adicionar projeto real.",
                    )
                ]
            }
        )

        normalized = _normalize_proof_detector(
            payload,
            "Habilidades: Python",
            "Obrigatorio: Kubernetes",
        )

        detector_by_skill = {
            item.habilidade: item for item in normalized.detector_prova_real
        }
        self.assertNotIn("Kubernetes", detector_by_skill)
        self.assertEqual(detector_by_skill["Python"].risco, "baixo")

    def test_recruiter_risk_has_minimum_severity(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={
                "compatibilidade": 55,
                "requisitos_obrigatorios_ausentes": ["Docker", "AWS"],
                "visao_recrutador": SAMPLE_ANALYSIS.visao_recrutador.model_copy(
                    update={"risco_de_rejeicao": "baixo"}
                ),
            }
        )

        calibrated = _calibrate_recruiter_risk(payload)

        self.assertEqual(
            calibrated.visao_recrutador.risco_de_rejeicao,
            "alto",
        )

    def test_recruiter_view_respects_unproven_required_skills(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={
                "detector_prova_real": [
                    RealProofDetection(
                        habilidade="Docker",
                        status="sem_comprovacao",
                        risco="alto",
                        motivo="Docker esta apenas na lista.",
                        como_comprovar="Adicionar projeto real.",
                    ),
                    RealProofDetection(
                        habilidade="Git",
                        status="sem_comprovacao",
                        risco="alto",
                        motivo="Git esta apenas na lista.",
                        como_comprovar="Adicionar experiencia real.",
                    ),
                ],
                "visao_recrutador": SAMPLE_ANALYSIS.visao_recrutador.model_copy(
                    update={
                        "resumo": "Atende todos os requisitos obrigatorios.",
                        "pontos_positivos": [
                            "Atende todos os requisitos obrigatorios.",
                            "A formacao esta alinhada ao cargo.",
                        ],
                        "risco_de_rejeicao": "baixo",
                    }
                ),
            }
        )

        calibrated = _calibrate_recruiter_risk(payload)

        self.assertEqual(
            calibrated.visao_recrutador.risco_de_rejeicao,
            "alto",
        )
        self.assertNotIn(
            "Atende todos os requisitos obrigatorios.",
            calibrated.visao_recrutador.pontos_positivos,
        )
        self.assertIn("Docker", calibrated.visao_recrutador.resumo)
        self.assertIn("Git", calibrated.visao_recrutador.resumo)

    def test_evolution_plan_is_sorted_and_deduplicated(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={
                "plano_evolucao": [
                    EvolutionPlanItem(
                        prioridade="baixa",
                        acao="Revisar formatacao.",
                        impacto_estimado="+2 pontos ATS",
                        prazo_sugerido="1 dia",
                    ),
                    EvolutionPlanItem(
                        prioridade="alta",
                        acao="Criar projeto Docker.",
                        impacto_estimado="+8 pontos ATS",
                        prazo_sugerido="7 dias",
                    ),
                    EvolutionPlanItem(
                        prioridade="alta",
                        acao="Criar projeto Docker.",
                        impacto_estimado="+8 pontos ATS",
                        prazo_sugerido="7 dias",
                    ),
                ]
            }
        )

        normalized = _normalize_evolution_plan(payload)

        self.assertEqual(len(normalized.plano_evolucao), 2)
        self.assertEqual(normalized.plano_evolucao[0].prioridade, "alta")
        self.assertEqual(
            normalized.plano_de_melhoria,
            ["Criar projeto Docker.", "Revisar formatacao."],
        )

    def test_missing_required_skills_cap_compatibility_and_ats_score(self) -> None:
        payload = ResumeAnalysisPayload.model_validate(
            {
                key: value
                for key, value in SAMPLE_ANALYSIS.model_dump().items()
                if key != "model"
            }
        ).model_copy(
            update={
                "requisitos_obrigatorios_ausentes": ["Docker", "Git"],
            }
        )

        calibrated = _calibrate_scores(payload)

        self.assertEqual(calibrated.compatibilidade, 55)
        self.assertEqual(
            calibrated.criterios.compatibilidade_vaga.pontuacao,
            55,
        )
        self.assertEqual(calibrated.ats_score, 75)


if __name__ == "__main__":
    unittest.main()
