# 🚀 GUIA COMPLETO DE DEPLOY - MIMA TOUR API

## ✅ PROJETO PRONTO PARA DEPLOY

Todos os arquivos necessários foram criados e otimizados para produção!

---

## 🎯 OPÇÃO 1: DEPLOY NO RAILWAY (RECOMENDADO)

### Por que Railway?
- ✅ **Suporte nativo ao Puppeteer**
- ✅ **Deploy automático via GitHub**
- ✅ **Plano gratuito generoso**
- ✅ **Configuração zero**
- ✅ **Domínio HTTPS automático**

### Passos para Deploy:

#### 1. **Preparar Repositório GitHub**
```bash
# Se ainda não tem git inicializado
git init
git add .
git commit -m "Initial commit - Mima Tour API ready for deploy"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/mima-tour-api.git
git branch -M main
git push -u origin main
```

#### 2. **Deploy no Railway**
1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Conecte sua conta GitHub
5. Selecione o repositório `mima-tour-api`
6. Railway detectará automaticamente que é Node.js
7. Clique em **"Deploy"**

#### 3. **Configurar Variáveis de Ambiente**
No painel do Railway:
1. Vá em **"Variables"**
2. Adicione as seguintes variáveis:
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PORT=3000
```

#### 4. **Aguardar Deploy**
- ⏱️ **Tempo estimado:** 3-5 minutos
- 🔗 **URL será gerada automaticamente:** `https://seu-projeto.railway.app`

---

## 🎯 OPÇÃO 2: DEPLOY NO RENDER (ALTERNATIVA GRATUITA)

### Passos para Deploy:

#### 1. **Preparar Repositório** (mesmo processo acima)

#### 2. **Deploy no Render**
1. Acesse: https://render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte GitHub e selecione o repositório
4. Configure:
   - **Name:** `mima-tour-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

#### 3. **Configurar Variáveis de Ambiente**
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

#### 4. **Deploy**
- ⏱️ **Tempo estimado:** 5-10 minutos
- 🔗 **URL:** `https://mima-tour-api.onrender.com`

---

## 🎯 OPÇÃO 3: DEPLOY MANUAL COM DOCKER

### Para VPS ou servidor próprio:

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/mima-tour-api.git
cd mima-tour-api

# 2. Build da imagem Docker
docker build -t mima-tour-api .

# 3. Executar container
docker run -d \
  --name mima-tour-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
  mima-tour-api
```

---

## 🧪 TESTAR APÓS DEPLOY

### 1. **Health Check**
```bash
curl https://SEU_DOMINIO.railway.app/health
```
**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T...",
  "uptime": "0:00:30",
  "version": "1.0.0"
}
```

### 2. **Testar API Básica**
```bash
curl https://SEU_DOMINIO.railway.app/trips/setembro
```

### 3. **Testar API Detalhada**
```bash
curl "https://SEU_DOMINIO.railway.app/trips/setembro?details=true"
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **Domínio Personalizado (Railway)**
1. No painel Railway → **"Settings"** → **"Domains"**
2. Clique **"Custom Domain"**
3. Digite seu domínio: `api.seusite.com`
4. Configure DNS CNAME: `api.seusite.com` → `seu-projeto.railway.app`

### **Monitoramento**
- **Railway:** Logs automáticos no painel
- **Render:** Logs na aba "Logs"
- **Uptime:** Use serviços como UptimeRobot

### **Escalabilidade**
- **Railway:** Upgrade automático conforme uso
- **Render:** Planos pagos para mais recursos

---

## 📊 CUSTOS ESTIMADOS

### **Railway (Recomendado)**
- ✅ **Gratuito:** $5 de crédito/mês
- 💰 **Pago:** $0.000463/GB-hora (~$10-20/mês)

### **Render**
- ✅ **Gratuito:** 750 horas/mês
- 💰 **Pago:** $7/mês (Starter)

### **VPS Próprio**
- 💰 **DigitalOcean:** $5-10/mês
- 💰 **AWS/GCP:** $5-15/mês

---

## 🚨 TROUBLESHOOTING

### **Erro: "Chrome not found"**
```bash
# Verificar se variáveis estão configuradas:
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### **Timeout Errors**
- Aumentar timeout no Railway/Render para 300s
- Verificar se health check está funcionando

### **Memory Issues**
- Railway: Upgrade para plano pago
- Render: Usar plano Starter ($7/mês)

---

## 🎉 DEPLOY COMPLETO!

### **URLs de Exemplo:**
- **Health:** `https://seu-projeto.railway.app/health`
- **Viagens Setembro:** `https://seu-projeto.railway.app/trips/setembro?details=true`
- **Documentação:** `https://seu-projeto.railway.app/`

### **Próximos Passos:**
1. ✅ Configurar domínio personalizado
2. ✅ Implementar cache (Redis)
3. ✅ Adicionar autenticação (se necessário)
4. ✅ Monitoramento e alertas

---

**🚀 SUA API ESTÁ ONLINE E FUNCIONANDO!** ✨

**Tempo total de deploy:** 5-10 minutos  
**Custo:** Gratuito (Railway/Render)  
**Performance:** Otimizada para produção
