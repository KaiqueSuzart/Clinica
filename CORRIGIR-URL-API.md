# 🔧 Corrigir URL da API no Frontend

## 🔴 Problema Identificado

O console mostra:
- `API_BASE_URL configurada: https://clinione-b9cvb.ondigitalocean.app/opi` ❌ (ERRADO)
- `VITE_API_BASE_URL da env: https://clinione-b9cyb.ondigitalocean.app/api` ✅ (CORRETO)

Isso causa o erro: `Cannot POST /apiauth/login` (falta a barra `/`)

## ✅ Solução

### 1. Verificar Variável de Ambiente no Digital Ocean

1. **Acesse o Digital Ocean Dashboard**
2. Vá em **Apps** → Seu app → **Components** → **clinica-frontend**
3. Vá em **Settings** → **Environment Variables**
4. Procure por `VITE_API_BASE_URL`

### 2. Valor Correto

A variável `VITE_API_BASE_URL` deve ser:

```
https://clinica-backend-xxxxx.ondigitalocean.app/api
```

**IMPORTANTE:**
- ✅ Deve terminar com `/api`
- ✅ Deve ser a URL do **backend**, não do frontend
- ❌ NÃO deve ser `https://clinione-b9cyb.ondigitalocean.app/api` (essa é a URL do frontend!)

### 3. Como Encontrar a URL do Backend

1. Vá em **Components** → **clinica-backend**
2. Copie a URL que aparece (algo como `https://clinica-backend-xxxxx.ondigitalocean.app`)
3. Adicione `/api` no final: `https://clinica-backend-xxxxx.ondigitalocean.app/api`

### 4. Atualizar a Variável

1. Vá em **Components** → **clinica-frontend** → **Settings** → **Environment Variables**
2. Edite `VITE_API_BASE_URL`
3. Cole a URL correta do backend + `/api`
4. Salve

### 5. Forçar Rebuild do Frontend

Após alterar a variável, você precisa forçar um rebuild:

1. Vá em **Settings** → **Deploy**
2. Clique em **"Force rebuild and deploy"**
3. Marque **"Clear build cache"**
4. Clique em **"Force rebuild and deploy"**

**OU** faça um pequeno commit para forçar rebuild:

```bash
# Adicionar um espaço em branco em qualquer arquivo do frontend
echo " " >> frontend/src/config.ts
git add frontend/src/config.ts
git commit -m "force rebuild frontend"
git push origin main
```

## 🔍 Verificar se Funcionou

Após o deploy, abra o console do navegador (F12) e verifique:

✅ **Deve aparecer:**
```
🔧 API_BASE_URL configurada: https://clinica-backend-xxxxx.ondigitalocean.app/api
🔧 VITE_API_BASE_URL da env: https://clinica-backend-xxxxx.ondigitalocean.app/api
```

❌ **NÃO deve aparecer:**
```
🔧 API_BASE_URL configurada: https://clinione-b9cvb.ondigitalocean.app/opi
```

## ⚠️ Problemas Comuns

### Problema 1: URL do Frontend em vez do Backend
- **Errado**: `VITE_API_BASE_URL=https://clinione-b9cyb.ondigitalocean.app/api`
- **Correto**: `VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app/api`

### Problema 2: Sem `/api` no final
- **Errado**: `VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app`
- **Correto**: `VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app/api`

### Problema 3: Build não pegou a variável
- **Solução**: Force rebuild com "Clear build cache"

## 📝 Checklist

- [ ] URL do backend identificada
- [ ] `VITE_API_BASE_URL` atualizada com URL do backend + `/api`
- [ ] Rebuild do frontend forçado
- [ ] Console mostra URL correta
- [ ] Login funciona sem erro 404


