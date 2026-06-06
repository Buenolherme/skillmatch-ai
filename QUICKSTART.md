# 🚀 Quick Start Guide — SkillMatch AI

## 5 Minutos para Rodar Localmente

### Pré-requisitos
- Node.js 16+
- Python 3.11+
- OpenAI API Key (em https://platform.openai.com/api-keys)

---

## ✨ Setup Rápido

### 1️⃣ Frontend

```bash
# Instale dependências (já feito, mas caso precise)
npm install

# Rode em desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

### 2️⃣ Backend

```bash
# Abra novo terminal na pasta backend
cd backend

# Crie ambiente virtual
python -m venv venv

# Ative (Windows)
venv\Scripts\activate

# Ative (Mac/Linux)
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Configure a chave API
# Crie arquivo .env na pasta backend:
echo OPENAI_API_KEY=sua-chave-aqui > .env
echo ENVIRONMENT=development >> .env

# Rode o servidor
python main.py
```

Backend rodará em: **http://localhost:8000**

---

## 🧪 Testando

### Health Check
```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{"status": "ok", "version": "1.0.0"}
```

### Análise Demo (sem backend)
Clique em "Ver análise demo" na home — funciona sem backend configurado.

### Análise Completa
1. Vá para "Analisar"
2. Faça upload de um PDF
3. Preencha os campos
4. Clique em "Analisar"

---

## 📋 Arquivo .env (Backend)

Crie `backend/.env`:

```env
OPENAI_API_KEY=sua-chave-openai
ENVIRONMENT=development
```

Para obter a chave:
1. Acesse https://platform.openai.com/api-keys
2. Clique em "Create API Key"
3. Copie a chave
4. Cole em `.env`

---

## 🎯 Funcionalidades Prontas

✅ Home premium com Hero  
✅ Upload e análise de PDF  
✅ Score ATS em tempo real  
✅ Compatibilidade com vaga  
✅ 6 abas de resultado  
✅ Modo claro e escuro  
✅ Análise demo  
✅ Histórico local  
✅ Design profissional  
✅ Build otimizado  

---

## 🛠️ Troubleshooting

### Porta 8000 em uso
```bash
# Mude para outra porta (ex: 8001)
python main.py --port 8001

# Atualize em frontend/.env:
VITE_API_URL=http://localhost:8001
```

### Módulos Python faltando
```bash
pip install --upgrade -r requirements.txt
```

### Erro ao extrair PDF
Certifique-se que PyPDF2 está instalado:
```bash
pip install PyPDF2==4.0.1
```

### Erro da IA "rate limit"
Aguarde alguns minutos antes de fazer nova análise.

---

## 📦 Build para Produção

### Frontend
```bash
npm run build
# Gera dist/ pronto para Vercel
```

### Backend
```bash
# Render detecta automaticamente requirements.txt
# Rode como:
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

---

## 🌐 Deploy

### Frontend → Vercel
1. Conecte repositório
2. Defina `VITE_API_URL` → URL do backend
3. Deploy automático

### Backend → Render
1. Conecte repositório
2. Selecione `python` como runtime
3. Start command: `python main.py`
4. Defina `OPENAI_API_KEY` nas variáveis

---

## 📞 Suporte

Para problemas:
1. Verifique se ambos servidores estão rodando
2. Verifique se a chave da OpenAI está correta
3. Veja logs em `backend/` e `frontend/`
4. Tente com análise demo primeiro

---

**Tudo pronto?** Vá para `http://localhost:5173` e comece a analisar! 🎉
