# 🎯 Como Adicionar Backend + Frontend no Digital Ocean App Platform

## ✅ Sim, você pode subir os 2 de uma vez!

O Digital Ocean App Platform permite adicionar **múltiplos componentes** no mesmo app. Você vai ter:

- **1 App** chamado "clinica"
- **2 Componentes** dentro desse app:
  - Componente 1: Backend (Web Service)
  - Componente 2: Frontend (Static Site)

---

## 📋 Passo a Passo Visual

### 1️⃣ Configurar o Backend (Primeiro Componente)

Na tela que você está vendo agora:

1. **Deployment settings** → Clique em **"Edit"**
   - **Source Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm run start:prod`
   - **HTTP Port**: `3001` (mude de 8080 para 3001)

2. **Environment variables** → Clique em **"Edit"**
   - Adicione todas as variáveis do Supabase e JWT (veja lista abaixo)

3. **Network** → Clique em **"Edit"**
   - **Public HTTP port**: `3001`

---

### 2️⃣ Adicionar o Frontend (Segundo Componente)

**ONDE ENCONTRAR:**
- Procure um botão **"Add Component"** ou **"Edit Components"** na parte superior da tela
- OU vá em **Settings** > **Components** depois de criar o app

**CONFIGURAÇÃO:**
1. Clique em **"Add Component"**
2. Selecione **"Static Site"** (NÃO Web Service!)
3. Configure:
   - **Name**: `frontend`
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
4. **Environment variables** → Adicione:
   ```
   VITE_API_BASE_URL=https://seu-backend.ondigitalocean.app
   ```
   *(Você vai atualizar essa URL depois do primeiro deploy)*

---

## 🔑 Variáveis de Ambiente Necessárias

### Backend (Componente 1):
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
PORT=3001
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_forte_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-app.ondigitalocean.app
FRONTEND_PREVIEW_URL=https://seu-app.ondigitalocean.app
```

### Frontend (Componente 2):
```
VITE_API_BASE_URL=https://seu-backend.ondigitalocean.app
```

---

## 🚀 Depois do Deploy

1. O Digital Ocean vai gerar URLs para cada componente:
   - Backend: `https://clinica-backend-xxxxx.ondigitalocean.app`
   - Frontend: `https://clinica-frontend-xxxxx.ondigitalocean.app`

2. Atualize as variáveis de ambiente:
   - No Frontend: atualize `VITE_API_BASE_URL` com a URL real do backend
   - No Backend: atualize `FRONTEND_URL` com a URL real do frontend

3. Faça um novo deploy para aplicar as mudanças

---

## ❓ Dúvidas Comuns

**P: Onde está o botão "Add Component"?**
R: Procure na parte superior da tela de configuração, ou vá em Settings > Components após criar o app.

**P: Posso fazer deploy dos 2 ao mesmo tempo?**
R: Sim! Depois de configurar ambos os componentes, clique em "Deploy" e os 2 serão deployados juntos.

**P: Preciso criar 2 apps separados?**
R: Não! Um app pode ter múltiplos componentes. Crie 1 app e adicione 2 componentes dentro dele.

**P: Como sei qual URL usar?**
R: Após o primeiro deploy, o Digital Ocean mostra as URLs de cada componente na dashboard.

