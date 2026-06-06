# SkillMatch AI 1.0

**Análise inteligente de currículos com IA** para estudantes, juniores, transição de carreira e recrutadores.

> Envie seu currículo em PDF, cole a descrição da vaga e receba uma análise completa com score ATS, compatibilidade, pontos fortes, fracos, palavras-chave e plano de melhoria — tudo em segundos.

## 🎯 Objetivo

SkillMatch AI é um analisador de currículos alimentado por IA que ajuda:

- **Candidatos**: Otimizar currículos para passar em triagens automáticas ATS
- **Estudantes**: Entender o que melhorar para conseguir primeira oportunidade
- **Juniores**: Validar se estão preparados para vagas específicas
- **Recrutadores**: Ter visão rápida e profissional do candidato

## ✨ Funcionalidades

### Para Candidatos
- ✅ Upload de currículo em PDF
- ✅ Análise contra descrição de vaga
- ✅ Score ATS (0-100) com interpretação
- ✅ Taxa de compatibilidade com vaga
- ✅ Pontos fortes e fracos identificados
- ✅ Palavras-chave encontradas e faltando
- ✅ Currículo otimizado para a vaga
- ✅ Sugestões por seção (Resumo, Experiência, Projetos, etc)
- ✅ Plano prático de melhoria
- ✅ Histórico local das 3 últimas análises
- ✅ Análise Demo sem enviar arquivo
- ✅ Modo claro e escuro

### Para Recrutadores
- ✅ "Visão do Recrutador" — resumo em 30 segundos
- ✅ Pontos fortes e riscos do candidato
- ✅ Top skills mais relevantes
- ✅ Perguntas sugeridas para entrevista
- ✅ Detector de prova real (skills comprovadas vs não comprovadas)

### Segurança & Privacidade
- ✅ Currículo analisado mas NÃO publicado
- ✅ Sem necessidade de login ou conta
- ✅ Análise processada localmente no backend
- ✅ Sem armazenamento permanente de dados
- ✅ Histórico salvo apenas no navegador (localStorage)

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + TypeScript + Vite
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Router** para navegação
- **react-circular-progressbar** para visualização de scores

### Backend
- **Python 3.11+**
- **FastAPI** para API REST
- **Uvicorn** servidor ASGI
- **PyPDF2** para extração de texto de PDF
- **OpenAI API** para análise com IA

### Deploy
- Frontend: Vercel
- Backend: Render
- Banco: localStorage (frontend) — sem backend complexo na v1.0

## 📋 Pré-requisitos

- Node.js 16+
- Python 3.11+
- Chave API da OpenAI

## 🚀 Como Rodar Localmente

### 1. Clonar e Instalar

```bash
# Clone o repositório
git clone <seu-repo>
cd skillmatch-ai

# Frontend: instale dependências
npm install

# Backend: crie ambiente virtual
cd backend
python -m venv venv

# Ative o ambiente
# No Windows:
venv\Scripts\activate
# No Mac/Linux:
source venv/bin/activate

# Instale dependências do backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

**Frontend** — crie `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

**Backend** — crie `.env`:

```env
OPENAI_API_KEY=sua-chave-openai-aqui
ENVIRONMENT=development
```

### 3. Obter chave da OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova chave API
3. Cole em `backend/.env`

### 4. Rodar o Projeto

**Terminal 1 — Backend**:

```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
python main.py
```

Backend rodará em `http://localhost:8000`

**Terminal 2 — Frontend**:

```bash
npm run dev
```

Frontend rodará em `http://localhost:5173`

Acesse `http://localhost:5173` no navegador.

## 📖 Como Usar

### Análise Completa

1. Vá para "Analisar"
2. Faça upload do seu currículo (PDF)
3. Informe o cargo desejado
4. Escolha nível (Estágio/Júnior/Pleno)
5. Escolha área (Front-End, Back-End, etc)
6. Cole a descrição completa da vaga
7. Clique "Analisar currículo"
8. Explore abas: Visão Geral, Palavras-chave, Currículo Otimizado, Mensagem, Visão do Recrutador, Plano de Melhoria

### Análise Demo

Clique em "Ver análise demo" na home para ver um exemplo completo sem enviar arquivo.

### Histórico Local

As 3 últimas análises são salvas no navegador. Você pode consultá-las depois.

## 📁 Estrutura de Pastas

```
skillmatch-ai/
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── UploadForm.tsx
│   │   ├── LoadingAnalysis.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── ResultTabs.tsx
│   │   └── Copyable.tsx
│   ├── pages/           # Páginas da aplicação
│   │   ├── HomePage.tsx
│   │   ├── AnalysisPage.tsx
│   │   ├── ResultPage.tsx
│   │   ├── DemoPage.tsx
│   │   └── NotFound.tsx
│   ├── hooks/           # React Hooks customizados
│   │   └── useTheme.ts
│   ├── services/        # Serviços de API
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Funções utilitárias
│   │   ├── formatters.ts
│   │   └── localStorage.ts
│   ├── data/            # Dados estáticos (demo)
│   │   └── demoData.ts
│   ├── App.tsx          # Componente raiz com Router
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── backend/
│   ├── main.py          # Aplicação FastAPI
│   ├── routes/
│   │   └── analyze.py   # Rota POST /analyze
│   ├── services/
│   │   └── ai_analyzer.py  # Lógica de análise com IA
│   ├── utils/
│   │   └── pdf_parser.py   # Extração de PDF
│   ├── models/
│   │   └── analysis.py     # Modelos Pydantic
│   ├── requirements.txt
│   ├── .env.example
│   └── .env (criar localmente)
├── public/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 Design

- **Tema escuro premium** por padrão (inspirado em Linear, Vercel, Raycast)
- **Glassmorphism** com gradientes azul/roxo
- **Animações suaves** com Framer Motion
- **Responsivo** para mobile, tablet e desktop
- **Modo claro** disponível com toggle
- **Paleta**:
  - Dark: `#050816` (fundo), `#0B1020` (cards)
  - Light: `#F8FAFC` (fundo), `#FFFFFF` (cards)
  - Accent: Azul `#38BDF8`, Roxo `#8B5CF6`

## 📊 Análise Detalhada

### Score ATS (0-100)
Mede otimização do currículo para sistemas de triagem automática. Considera:
- Palavras-chave da vaga
- Estrutura e formatação
- Contato e links
- Tamanho e completude

### Compatibilidade (%)
Percentual de alinhamento entre currículo e requisitos da vaga.

### Clareza
Score da estrutura, organização e legibilidade do currículo.

### Prova Real
Identifica habilidades citadas mas não comprovadas em projetos/experiência.

### Plano de Melhoria
10 passos práticos e acionáveis para aumentar o score ATS.

## 🔄 Fluxo de Análise

1. **Upload & Validação**
   - Valida se é PDF
   - Verifica tamanho (máx 10MB)
   - Extrai texto

2. **Processamento**
   - Analisa com OpenAI API
   - Extrai palavras-chave
   - Calcula scores

3. **Geração**
   - Gera currículo otimizado
   - Cria mensagem para recrutador
   - Produz visão do recrutador
   - Elabora plano de melhoria

4. **Apresentação**
   - Exibe resultado em abas
   - Permite copiar, baixar
   - Salva no histórico local

## 🐛 Tratamento de Erros

- Arquivo inválido → "Apenas PDF"
- PDF vazio → "PDF sem conteúdo"
- Vaga vazia → "Descrição da vaga obrigatória"
- Arquivo grande → "Máximo 10MB"
- Erro na IA → "Serviço indisponível, tente depois"
- Erro de extração → "Não consegui ler o PDF"

Todos com mensagens amigáveis e orientação clara.

## 🔜 Próximos Upgrades (v2.0+)

- [ ] Banco de dados com histórico de análises
- [ ] Login com Supabase Auth
- [ ] Múltiplas análises salvas
- [ ] Comparar 2 vagas
- [ ] Export PDF profissional
- [ ] Dashboard de progresso
- [ ] Integração com LinkedIn
- [ ] Suporte a mais formatos (DOCX, etc)
- [ ] APIs customizáveis (OpenAI, Claude, etc)
- [ ] Modo empresarial para recrutadores
- [ ] Análise em tempo real enquanto digita
- [ ] Feed de dicas e artigos

## 📝 Notas Importantes

### v1.0 — Foco em Estabilidade

- Sem login obrigatório
- Sem banco complexo
- Análise é local e anônima
- Histórico apenas no navegador

### Próximas Prioridades

1. Testar em produção com 100+ análises
2. Coletar feedback de usuários
3. Otimizar tempo de resposta
4. Melhorar acurácia das sugestões da IA

## 🛡️ Segurança

- CORS habilitado para frontend
- Validação de entrada no backend
- Sem armazenamento de PII
- Rate limiting pode ser adicionado
- Chave API segura no backend

## 📄 Licença

MIT License — Veja LICENSE para detalhes.

## 🤝 Contribuindo

Para enviar melhorias, faça fork e pull request!

---

**SkillMatch AI v1.0** — Transformando currículos em oportunidades 🚀
