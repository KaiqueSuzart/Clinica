# 🔧 Troubleshooting: Erro 401 Unauthorized

## Problema
O frontend está mostrando o erro `{"statusCode":401,"message":"Token de autorização não fornecido","error":"Unauthorized"}` na tela.

## Possíveis Causas

### 1. ❌ Variável `VITE_API_BASE_URL` não configurada ou incorreta

**Verificar no Digital Ocean:**
1. Vá em **Settings** → **App-Level Environment Variables**
2. Procure por `VITE_API_BASE_URL`
3. Deve apontar para a URL do **backend**, não do frontend!

**Valor correto:**
```
VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app
```

**Valor ERRADO (não usar):**
```
VITE_API_BASE_URL=https://clinione-b9cyb.ondigitalocean.app  ❌
```

### 2. ❌ Backend não está rodando ou não está acessível

**Verificar:**
1. Acesse a URL do backend diretamente: `https://clinica-backend-xxxxx.ondigitalocean.app/api`
2. Deve aparecer a documentação do Swagger
3. Se não aparecer, o backend não está rodando

### 3. ❌ Cache do navegador

**Solução:**
1. Pressione `Ctrl + Shift + Delete` para limpar cache
2. Ou abra uma **aba anônima/privada**
3. Ou force refresh: `Ctrl + F5`

### 4. ❌ CORS não configurado no backend

**Verificar no backend (Digital Ocean):**
- Variável `FRONTEND_URL` deve apontar para a URL do frontend
- Variável `FRONTEND_PREVIEW_URL` também deve estar configurada

## Como Verificar

### 1. Abrir Console do Navegador (F12)
Procure por estas mensagens:
- `🔧 API_BASE_URL configurada: ...` → Deve mostrar a URL do backend
- `🔍 Verificando autenticação em: ...` → Deve mostrar a URL completa

### 2. Verificar Network Tab (F12 → Network)
- Procure por requisições para `/auth/me` ou outras rotas da API
- Veja qual URL está sendo usada
- Se estiver usando `localhost:3001` ou a URL do frontend, a variável não foi configurada corretamente

### 3. Verificar Variáveis de Ambiente no Digital Ocean

**Frontend Component:**
```
VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app
```

**Backend Component:**
```
FRONTEND_URL=https://clinione-b9cyb.ondigitalocean.app
FRONTEND_PREVIEW_URL=https://clinione-b9cyb.ondigitalocean.app
```

## Solução Passo a Passo

1. **Verificar URL do Backend:**
   - No Digital Ocean, vá em **Components** → **clinica-backend**
   - Copie a URL (algo como `https://clinica-backend-xxxxx.ondigitalocean.app`)

2. **Configurar Frontend:**
   - Vá em **Components** → **clinica-frontend** → **Settings**
   - Em **Environment Variables**, adicione/edite:
     ```
     VITE_API_BASE_URL=https://clinica-backend-xxxxx.ondigitalocean.app
     ```
   - **IMPORTANTE:** Substitua `xxxxx` pela URL real do seu backend

3. **Forçar Rebuild:**
   - Após alterar a variável, faça um pequeno commit para forçar rebuild:
     ```bash
     echo " " >> frontend/src/config.ts
     git add frontend/src/config.ts
     git commit -m "force rebuild"
     git push origin main
     ```

4. **Limpar Cache e Testar:**
   - Aguarde o deploy completar (~2 minutos)
   - Limpe o cache do navegador
   - Abra o console (F12) e verifique os logs

## Se Ainda Não Funcionar

1. **Verifique os logs do backend no Digital Ocean:**
   - Vá em **Runtime Logs** do componente backend
   - Veja se há erros de conexão ou CORS

2. **Teste o backend diretamente:**
   - Acesse: `https://clinica-backend-xxxxx.ondigitalocean.app/api`
   - Deve aparecer a documentação do Swagger
   - Se não aparecer, o backend não está rodando corretamente

3. **Verifique se o backend está acessível:**
   - Tente fazer uma requisição manual:
     ```bash
     curl https://clinica-backend-xxxxx.ondigitalocean.app/api
     ```

## Erro Esperado vs. Erro Real

### ✅ Erro Esperado (Normal)
- Quando você não está logado, o frontend tenta verificar autenticação
- O backend retorna 401 (normal, você não está logado)
- O frontend **não deve mostrar** esse erro na tela
- Deve apenas mostrar a tela de login

### ❌ Erro Real (Problema)
- O erro 401 está sendo exibido como JSON na página
- Isso significa que alguma requisição está falhando e o navegador está mostrando a resposta JSON
- Pode ser:
  - URL da API incorreta
  - Backend não está rodando
  - CORS bloqueando requisições


