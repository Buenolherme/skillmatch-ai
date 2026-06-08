# SkillMatch AI

Plataforma de análise de currículos com Inteligência Artificial que compara um currículo em PDF com a descrição de uma vaga e gera uma avaliação completa do perfil profissional.

O SkillMatch AI apresenta score ATS, compatibilidade com a vaga, pontos fortes, pontos fracos, palavras-chave faltantes, visão do recrutador, detector de prova real e um plano de evolução personalizado.

## Links

- **Site online:** https://skillmatch-abdqcmg1n-guilherme-rodrigues-projects1.vercel.app/
- **Repositório:** [github.com/Buenolherme/skillmatch-ai](https://github.com/Buenolherme/skillmatch-ai)
- **Vídeo demo:** https://youtu.be/Skw2drUEht0

## Funcionalidades

- Upload de currículo em PDF
- Extração real de texto do PDF
- Análise com Gemini AI
- Score ATS
- Compatibilidade com a vaga
- Identificação de palavras-chave faltantes
- Detector de Prova Real
- Visão do Recrutador
- Plano de Evolução
- Recomendações personalizadas
- Fallback automático de modelo Gemini

## Tecnologias

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Python
- FastAPI
- PyPDF2
- Gemini API

### Deploy

- Vercel
- Render

## Como rodar localmente

### Pré-requisitos

- Node.js e npm
- Python e pip
- Chave de acesso à Gemini API

### Frontend

Na raiz do projeto, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

### Backend

Em outro terminal, acesse o diretório do backend, instale as dependências e inicie a API:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Variáveis de ambiente

Configure as variáveis no ambiente local. Não publique chaves de API no repositório.

### Backend

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
```

## Roadmap V2.0

- [ ] Login
- [ ] Histórico de análises
- [ ] Exportação de currículo otimizado
- [ ] Carta de apresentação gerada por IA
- [ ] Dashboard do candidato
- [ ] Modo recrutador avançado
- [ ] Melhorias no Scout
- [ ] Sistema premium

## Autor

**Guilherme Rodrigues**

- **LinkedIn:** [linkedin.com/in/guilherme-rodrigues-072a89232](https://www.linkedin.com/in/guilherme-rodrigues-072a89232)
- **GitHub:** [github.com/Buenolherme](https://github.com/Buenolherme)
