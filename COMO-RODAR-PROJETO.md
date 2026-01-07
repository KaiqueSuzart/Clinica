# 🚀 Como Rodar o Projeto Completo

## ⚠️ IMPORTANTE: Você precisa rodar AMBOS (Backend e Frontend)

O frontend precisa do backend rodando para funcionar, pois ele faz chamadas à API.

---

## 📦 1. BACKEND (NestJS)

### Passo 1: Entrar na pasta do backend
```bash
cd Clinica/backend
```

### Passo 2: Instalar dependências (se ainda não instalou)
```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente
Certifique-se de ter um arquivo `.env` na pasta `Clinica/backend/` com:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (opcional, padrão é 3001)
- `JWT_SECRET`

### Passo 4: Rodar o backend
```bash
npm run start:dev
```

**O backend vai rodar em:** `http://localhost:3001`

Você verá no terminal algo como:
```
[Nest] 12345  - 01/01/2025, 12:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2025, 12:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/01/2025, 12:00:00 AM     LOG [NestApplication] Nest application successfully started
```

---

## 🎨 2. FRONTEND (React + Vite)

### Passo 1: Abrir um NOVO terminal (deixe o backend rodando)

### Passo 2: Entrar na pasta do frontend
```bash
cd Clinica/frontend
```

### Passo 3: Instalar dependências (se ainda não instalou)
```bash
npm install
```

### Passo 4: Rodar o frontend

**Opção A: Modo Dev (Recomendado para desenvolvimento)**
```bash
npm run dev
```
Acesse: `http://localhost:5173`

**Opção B: Preview (Build de produção)**
```bash
npm run build
npm run preview
```
Acesse: `http://localhost:4173`

---

## ✅ Ordem Correta

1. **Primeiro**: Rode o backend (`npm run start:dev` na pasta `backend`)
2. **Depois**: Rode o frontend (`npm run dev` na pasta `frontend`)
3. **Acesse**: `http://localhost:5173` (ou a porta que aparecer)

---

## 🔍 Verificar se está tudo funcionando

### Backend:
- Terminal mostra: "Nest application successfully started"
- API disponível em: `http://localhost:3001`

### Frontend:
- Terminal mostra: "Local: http://localhost:5173"
- Abra no navegador e faça login

### Testar API:
Abra no navegador: `http://localhost:3001` (deve mostrar algo do NestJS ou erro 404, mas não erro de conexão)

---

## 🐛 Problemas Comuns

### Backend não inicia:
- Verifique se a porta 3001 está livre
- Verifique se o arquivo `.env` existe e está configurado
- Verifique se as dependências foram instaladas (`npm install`)

### Frontend não conecta ao backend:
- Verifique se o backend está rodando
- Verifique se a URL no `config.ts` está correta: `http://localhost:3001`
- Abra o DevTools (F12) e veja os erros no Console

### Porta já em uso:
- Feche outros processos usando a porta
- Ou mude a porta no `.env` (backend) ou `vite.config.ts` (frontend)

---

## 📝 Resumo Rápido

**Terminal 1 (Backend):**
```bash
cd Clinica/backend
npm run start:dev
```

**Terminal 2 (Frontend):**
```bash
cd Clinica/frontend
npm run dev
```

**Acessar:** `http://localhost:5173`




