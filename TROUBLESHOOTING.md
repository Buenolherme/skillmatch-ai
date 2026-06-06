## 🔧 Guia de Troubleshooting - SkillMatch AI

### ⚠️ PROBLEMA: "Erro inesperado ao analisar o currículo"

---

## 1. **Verificação Rápida**

### ✅ Pré-requisitos
- [ ] Backend rodando em `http://localhost:8000`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] `OPENAI_API_KEY` configurada no `.env` do backend
- [ ] PDF válido e não vazio

### ✅ Verificar Backend

```bash
# Testar health check
curl http://localhost:8000/health

# Resposta esperada:
# {"status":"ok","version":"1.0.0"}
```

---

## 2. **Configurar OpenAI API Key**

### Passo 1: Obter a chave
1. Ir para https://makersuite.google.com/app/apikey
2. Clique em "Create API key"
3. Copie a chave gerada

### Passo 2: Configurar no Backend
```bash
# Editar: backend/.env
OPENAI_API_KEY=sua-chave-aqui
ENVIRONMENT=development
```

### Passo 3: Reiniciar o backend
```bash
cd backend
python main.py
```

---

## 3. **Problemas Específicos e Soluções**

### ❌ "PDF inválido"
- **Causa**: Arquivo não é PDF válido
- **Solução**: 
  - Use um PDF real
  - Teste com um PDF com conteúdo (não vazio)
  - Verifique se não está corrompido

### ❌ "PDF vazio"
- **Causa**: PDF tem 0 páginas ou sem texto extraível
- **Solução**:
  - Use um PDF com conteúdo
  - Se for protegido, remova a proteção

### ❌ "Erro ao extrair texto do PDF"
- **Causa**: PDF está protegido ou corrompido
- **Solução**:
  - Teste com outro PDF
  - Se for protegido, use ferramentas para remover proteção
  - Conteúdo: `backend/utils/pdf_parser.py`

### ❌ "Chave da API não configurada"
- **Causa**: `OPENAI_API_KEY` faltando no `.env`
- **Solução**:
  - Obter chave em https://makersuite.google.com/app/apikey
  - Adicionar em `backend/.env`:
    ```
    OPENAI_API_KEY=sua-chave-aqui
    ```
  - Reiniciar backend

### ❌ "Serviço de IA temporariamente indisponível"
- **Causa**: API da OpenAI está down ou rejeitou requisição
- **Solução**:
  - Aguarde alguns minutos
  - Verifique status da API Google em https://status.cloud.google.com
  - Tente novamente

### ❌ "Timeout da IA"
- **Causa**: API da OpenAI levou muito tempo
- **Solução**:
  - Tente novamente
  - Reduza o tamanho do currículo ou da vaga
  - Verifique conexão de internet

### ❌ "Erro de conexão com servidor"
- **Causa**: Backend não está rodando
- **Solução**:
  - Verificar se backend está em `http://localhost:8000`
  - Iniciar backend:
    ```bash
    cd backend
    python main.py
    ```
  - Verificar porta 8000 não está em uso

---

## 4. **Logs Detalhados**

### Backend
```bash
# Rodar backend com logs
cd backend
python main.py
```

Procure por:
- ✅ "Análise concluída com sucesso"
- ❌ "OPENAI_API_KEY não configurada"
- ❌ "Erro ao extrair PDF"
- ❌ "Erro na análise IA"

### Frontend
```
Browser Console (F12 > Console)
```

Procure por:
- `[Frontend] Iniciando análise`
- `[Frontend] Resposta recebida`
- `[Frontend] Análise concluída com sucesso`
- `[API Error...]` - indica erro

---

## 5. **Teste Manual do Endpoint**

### Com cURL (Linux/Mac)
```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@curriculum.pdf" \
  -F "job_description=Desenvolvedor Python com Django" \
  -F "job_title=Desenvolvedor Senior" \
  -F "level=pleno" \
  -F "area=Back-End"
```

### Com Postman
1. Abrir Postman
2. Criar POST para `http://localhost:8000/analyze`
3. Body > form-data:
   - `file`: [selecionar PDF]
   - `job_description`: "texto da vaga"
   - `job_title`: "cargo"
   - `level`: "pleno"
   - `area`: "Back-End"
4. Enviar

---

## 6. **Fluxo Completo de Análise**

```
FRONTEND
   ↓
1. Usuario seleciona PDF
   ↓
2. FormData enviado para http://localhost:8000/analyze
   ↓
BACKEND
   ↓
3. ✅ Validação: é PDF? tem descrição?
4. ✅ Leitura: arquivo lido com sucesso?
5. ✅ Extração: texto extraído do PDF?
6. ✅ IA: OPENAI_API_KEY configurada?
7. ✅ Análise: OpenAI respondeu?
8. ✅ Parsing: JSON válido?
   ↓
9. Response enviado de volta
   ↓
FRONTEND
   ↓
10. ✅ JSON parseado
11. ✅ Resultado exibido
```

---

## 7. **Checklist de Setup Inicial**

- [ ] Clone o projeto
- [ ] `npm install` (frontend)
- [ ] `pip install -r backend/requirements.txt` (backend)
- [ ] Obter `OPENAI_API_KEY` na OpenAI
- [ ] Criar `backend/.env`:
  ```
  OPENAI_API_KEY=sua-chave
  ENVIRONMENT=development
  ```
- [ ] `npm run build` (verificar)
- [ ] Iniciar backend: `python backend/main.py`
- [ ] Iniciar frontend: `npm run dev`
- [ ] Testar em `http://localhost:5173`

---

## 8. **Ficheiro de Exemplo**

Use PDF com conteúdo como:
- Seu próprio currículo
- Exemplo em português com experiências reais
- Mínimo: nome, email, experiência, habilidades

---

## 9. **Debug Mode**

### Ver todos os logs do backend
```bash
cd backend
python -u main.py  # unbuffered output
```

### Ver requests do frontend (DevTools)
```
F12 > Network tab > capturar requisição para /analyze
```

---

## 10. **Suporte**

Se o problema persistir:
1. Verificar console do backend (Python logs)
2. Verificar console do frontend (F12 > Console)
3. Verificar status da OpenAI API
4. Verificar `.env` tem `OPENAI_API_KEY`
5. Testar com curl/Postman

---

**Última atualização**: 2024
**Status**: Testado e funcionando
