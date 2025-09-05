# 🚀 DEPLOY RÁPIDO - 5 MINUTOS

## ✅ PROJETO PRONTO PARA DEPLOY!

Todos os arquivos estão configurados. Siga estes passos:

---

## 🎯 OPÇÃO 1: RAILWAY (MAIS FÁCIL)

### **1. Preparar GitHub**
```bash
# Se não tem git ainda:
git init
git add .
git commit -m "Mima Tour API - Ready for deploy"

# Criar repo no GitHub e fazer push:
git remote add origin https://github.com/SEU_USUARIO/mima-tour-api.git
git branch -M main
git push -u origin main
```

### **2. Deploy no Railway**
1. 🌐 Acesse: **https://railway.app**
2. 🔗 Clique **"Start a New Project"**
3. 📂 Selecione **"Deploy from GitHub repo"**
4. 🔑 Conecte GitHub e selecione seu repositório
5. 🚀 Clique **"Deploy"**

### **3. Configurar Variáveis (IMPORTANTE!)**
No painel Railway → **"Variables"** → Adicionar:
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### **4. Aguardar Deploy**
- ⏱️ **3-5 minutos**
- 🔗 **URL automática:** `https://seu-projeto.railway.app`

---

## 🎯 OPÇÃO 2: RENDER (ALTERNATIVA)

### **1. Preparar GitHub** (mesmo processo acima)

### **2. Deploy no Render**
1. 🌐 Acesse: **https://render.com**
2. 🔗 **"New +"** → **"Web Service"**
3. 📂 Conecte GitHub e selecione repositório
4. ⚙️ Configure:
   - **Name:** `mima-tour-api`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### **3. Variáveis de Ambiente**
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

---

## 🧪 TESTAR APÓS DEPLOY

### **1. Health Check**
```bash
curl https://SEU_DOMINIO/health
```

### **2. API Básica**
```bash
curl https://SEU_DOMINIO/trips/setembro
```

### **3. API Completa**
```bash
curl "https://SEU_DOMINIO/trips/setembro?details=true"
```

---

## 🎉 PRONTO!

### **Sua API estará disponível em:**
- 📡 **Railway:** `https://seu-projeto.railway.app`
- 📡 **Render:** `https://mima-tour-api.onrender.com`

### **Endpoints principais:**
- 🏥 **Health:** `/health`
- 📅 **Setembro:** `/trips/setembro?details=true`
- 📅 **Outubro:** `/trips/outubro?details=true`
- 📋 **Documentação:** `/`

### **Performance:**
- ⚡ **Scraping básico:** ~2 segundos
- 🔍 **Scraping detalhado:** ~22 segundos
- 🔄 **Retry automático:** Sem timeouts

---

## 🚨 SE DER PROBLEMA

### **Chrome not found:**
✅ Verificar se as variáveis de ambiente estão configuradas

### **Timeout:**
✅ Aguardar alguns minutos - primeira execução é mais lenta

### **500 Error:**
✅ Verificar logs no painel Railway/Render

---

**🚀 DEPLOY EM 5 MINUTOS - SUA API ONLINE!** ✨

**Custo:** Gratuito  
**Tempo:** 5 minutos  
**Resultado:** API profissional funcionando
