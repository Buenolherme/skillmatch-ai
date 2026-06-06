## 🚀 Setup Completo - SkillMatch AI

### Pré-requisitos
- Node.js 18+
- Python 3.8+
- pip

---

## 1. **Setup Frontend**

```bash
# Instalar dependências
npm install

# Testar build
npm run build

# Iniciar dev server
npm run dev
# Disponível em: http://localhost:5173
```

---

## 2. **Setup Backend**

### 2.1 Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2.2 Configurar API Key da OpenAI

**⚠️ CRÍTICO**: Sem isso, as análises não funcionarão!

```bash
# Ir para: https://makersuite.google.com/app/apikey
# Clique em "Create API key"
# Copie a chave
```

### 2.3 Configurar arquivo `.env`

```bash
# Editar: backend/.env
OPENAI_API_KEY=cole-sua-chave-aqui
ENVIRONMENT=development
```

### 2.4 Iniciar backend
```bash
cd backend
python main.py
# Servidor rodará em: http://localhost:8000
```

---

## 3. **Verificar Conexão**

```bash
# Testar health check
curl http://localhost:8000/health

# Resposta esperada:
# {"status":"ok","version":"1.0.0"}
```

---

## 4. **Testar Análise Completa**

### Passo 1: Preparar um PDF
- Use seu currículo em PDF
- Ou crie um com conteúdo em português
- Mínimo: nome, email, experiência

### Passo 2: Abrir interface
- Frontend: http://localhost:5173
- Clique em "Analisar meu currículo"

### Passo 3: Enviar análise
1. Selecione seu PDF
2. Digite um cargo (ex: "Desenvolvedor Python")
3. Cole uma descrição de vaga
4. Clique "Analisar meu currículo"

### Passo 4: Verificar resultado
- ✅ Tela de loading com animações
- ✅ Resultado com scores e análises
- ✅ Abas funcionando (Visão Geral, Palavras-chave, etc)

---

## 5. **Mensagens de Erro Específicas (Implementadas)**

Se alguma coisa der errado, você verá:

| Erro | Causa | Solução |
|------|-------|---------|
| "PDF inválido" | Não é PDF | Use PDF válido |
| "PDF vazio" | Sem conteúdo | Verifique arquivo |
| "Erro ao extrair texto" | PDF protegido | Remova proteção |
| "Chave da API não configurada" | Falta OPENAI_API_KEY | Configure em `.env` |
| "Serviço de IA indisponível" | API da OpenAI down | Tente novamente |
| "Timeout" | IA levou muito tempo | Verifique conexão |
| "Erro de conexão" | Backend offline | Inicie backend |

---

## 6. **Logs Detalhados**

### Backend
```
[Timestamp] - routes.analyze - INFO - Iniciando análise: ...
[Timestamp] - services.ai_analyzer - INFO - Enviando prompt para OpenAI...
[Timestamp] - routes.analyze - INFO - Análise completada com sucesso
```

### Frontend (F12 > Console)
```
[Frontend] Iniciando análise: {arquivo, tamanho, cargo, area}
[Frontend] Resposta recebida: {status: 200, ok: true}
[Frontend] Análise concluída com sucesso: {atsScore: 87, jobMatch: 82}
```

---

## 7. **Fluxo de Dados**

```
PDF (Frontend)
    ↓
FormData
    ↓
POST /analyze (Backend)
    ↓
Extrair texto
    ↓
Chamar OpenAI API
    ↓
Parsear JSON
    ↓
Gerar otimizações
    ↓
JSON Response
    ↓
Frontend exibe resultado
```

---

## 8. **Troubleshooting Rápido**

```bash
# Backend não inicia?
python backend/main.py
# Verificar: Python 3.8+, dependências instaladas

# API Key não funciona?
# Ir para https://makersuite.google.com/app/apikey
# Criar nova chave
# Adicionar em backend/.env

# Build falha?
npm run build
# Verificar: Node 18+, todas dependências instaladas

# Frontend não conecta backend?
# Verificar: VITE_API_URL em .env (padrão: http://localhost:8000)
# Backend rodando na porta correta
```

---

## 9. **Arquivos Modificados com Melhorias**

- ✅ `backend/main.py` - Logging melhorado, health check
- ✅ `backend/routes/analyze.py` - Logging detalhado em cada etapa
- ✅ `backend/services/ai_analyzer.py` - Tratamento de erros específicos
- ✅ `backend/utils/pdf_parser.py` - Validações e logs detalhados
- ✅ `src/services/api.ts` - Mensagens de erro específicas
- ✅ `backend/.env` - Template com instruções

---

## 10. **Verificação Final**

```bash
# Build
npm run build  # ✅ deve passar

# TypeScript
npx tsc --noEmit  # ✅ sem erros

# Backend
python backend/main.py  # ✅ iniciar sem erros

# Frontend
npm run dev  # ✅ iniciar sem erros

# Teste manual
curl http://localhost:8000/health  # ✅ {"status":"ok",...}
```

---

## Status: ✅ PRONTO PARA USAR

Todas as correções foram implementadas:
- Logging completo em cada etapa
- Mensagens de erro específicas
- Tratamento de CORS
- Validação de PDF
- Configuração de API Key
- Testes de conexão

**Próximo passo**: Configure a `OPENAI_API_KEY` e comece a analisar!
