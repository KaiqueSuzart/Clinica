# 🚀 Guia de Deploy para Digital Ocean

Este guia mostra como fazer deploy completo da aplicação (Backend + Frontend) no Digital Ocean.

---

## 📋 Pré-requisitos

- Conta no Digital Ocean
- Domínio (opcional, mas recomendado)
- Acesso SSH ao servidor
- Git configurado
- Node.js instalado no servidor (v18+)

---

## 🎯 Opções de Deploy no Digital Ocean

### Opção 1: App Platform (Mais Fácil - Recomendado)
- Deploy automático via Git
- SSL automático
- Escalabilidade automática
- **Custo**: ~$12-25/mês

### Opção 2: Droplet (Mais Controle - Mais Barato)
- Servidor VPS completo
- Controle total
- Configuração manual
- **Custo**: ~$6-12/mês

**Vou mostrar ambas as opções!**

---

## 🌐 Opção 1: Digital Ocean App Platform (Recomendado)

### ⚡ Resumo Rápido

O App Platform permite fazer deploy de **backend e frontend juntos** no mesmo app, adicionando múltiplos componentes:

```
App: clinica
├── Componente 1: Backend (Web Service)
│   ├── Source: backend/
│   ├── Build: npm install && npm run build
│   ├── Run: npm run start:prod
│   ├── Port: 3001
│   └── Env: SUPABASE_URL, JWT_SECRET, etc.
│
└── Componente 2: Frontend (Static Site)
    ├── Source: frontend/
    ├── Build: npm install && npm run build
    ├── Output: dist/
    └── Env: VITE_API_BASE_URL
```

**Passos principais:**
1. Conectar repositório GitHub
2. Configurar componente Backend (Web Service)
3. Adicionar componente Frontend (Static Site)
4. Configurar variáveis de ambiente
5. Deploy!

---

### Passo 1: Preparar o Repositório Git

```bash
# No seu computador local
cd Clinica
git init
git add .
git commit -m "Preparar para deploy"
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

### Passo 2: Criar App no Digital Ocean

1. Acesse: https://cloud.digitalocean.com/apps
2. Clique em **"Create App"**
3. Conecte seu repositório GitHub/GitLab
4. Selecione o repositório `KaiqueSuzart/Clinica` e branch `main`

### Passo 3: Configurar os Componentes (Backend + Frontend)

**IMPORTANTE:** O App Platform permite adicionar múltiplos componentes no mesmo app! Você vai configurar backend e frontend juntos.

#### 3.1: Configurar Backend (Componente 1)

1. **O Digital Ocean pode detectar automaticamente o backend**, mas se não detectar ou você quiser configurar manualmente:
   - Clique em **"Edit"** no componente detectado OU **"Add Component"**
   - **Type**: `Web Service`
   - **Name**: `backend` (ou deixe o padrão)
   - **Source Directory**: `backend`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Run Command**: `node dist/main.js`
   - **HTTP Port**: `3001` (mude de 8080 para 3001)

2. **Variáveis de Ambiente do Backend:**
   - Clique em **"Edit"** na seção "Environment variables"
   - Adicione as seguintes variáveis (uma por linha):
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
   **Nota:** Você vai precisar pegar a URL do frontend depois que criar o componente. Pode deixar temporariamente como `https://seu-app.ondigitalocean.app` e atualizar depois.

#### 3.2: Adicionar Frontend (Componente 2)

**💡 ONDE ENCONTRAR "Add Component":**
- Se você está na tela de configuração inicial, procure um botão **"Add Component"** ou **"Edit Components"** na parte superior ou lateral
- Se você já criou o app, vá em **Settings** > **Components** e clique em **"Add Component"**

1. **Adicionar Novo Componente:**
   - Clique em **"Add Component"** ou **"Edit Components"**
   - Selecione **"Static Site"** (NÃO Web Service!)
   - **Name**: `frontend` (ou deixe o padrão)
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

2. **Variáveis de Ambiente do Frontend:**
   - Clique em **"Edit"** na seção "Environment variables" do componente frontend
   - Adicione:
   ```
   VITE_API_BASE_URL=https://seu-backend.ondigitalocean.app
   ```
   **Nota:** Substitua `seu-backend.ondigitalocean.app` pela URL real do componente backend que o Digital Ocean vai gerar (algo como `clinica-backend-xxxxx.ondigitalocean.app`). Você pode ver essa URL depois de fazer o primeiro deploy ou na seção de componentes.

#### 3.3: Verificar Configuração

Você deve ter **2 componentes** configurados:
- ✅ **Componente 1**: Backend (Web Service) na porta 3001
- ✅ **Componente 2**: Frontend (Static Site) com output em `dist`

### Passo 4: Configurar Domínio (Opcional)

1. No App Platform, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções
4. SSL será configurado automaticamente

### Passo 5: Fazer Deploy

1. **Revisar Configurações:**
   - Verifique se ambos os componentes estão configurados
   - Verifique se as variáveis de ambiente estão corretas
   - **Importante:** Anote a URL do backend que será gerada (algo como `clinica-backend-xxxxx.ondigitalocean.app`)

2. **Primeiro Deploy:**
   - Clique em **"Deploy"** ou **"Create Resources"**
   - Aguarde o build e deploy (pode levar 5-10 minutos)
   - O Digital Ocean vai gerar URLs para cada componente

3. **Atualizar Variáveis de Ambiente:**
   - Após o primeiro deploy, copie a URL do backend gerada
   - Vá em **Settings** > **Components** > **Frontend** > **Environment Variables**
   - Atualize `VITE_API_BASE_URL` com a URL real do backend
   - Vá em **Settings** > **Components** > **Backend** > **Environment Variables**
   - Atualize `FRONTEND_URL` e `FRONTEND_PREVIEW_URL` com a URL real do frontend
   - Faça um novo deploy para aplicar as mudanças

4. **Acessar Aplicação:**
   - A URL do frontend será algo como: `https://clinica-frontend-xxxxx.ondigitalocean.app`
   - A URL do backend será algo como: `https://clinica-backend-xxxxx.ondigitalocean.app`
   - Acesse a URL do frontend no navegador!

---

## 🖥️ Opção 2: Droplet (VPS)

### Passo 1: Criar Droplet

1. Acesse: https://cloud.digitalocean.com/droplets/new
2. Escolha:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/mês mínimo)
   - **Datacenter**: Mais próximo dos usuários
   - **Authentication**: SSH Key (recomendado)
3. Clique em **"Create Droplet"**

### Passo 2: Conectar ao Servidor

```bash
ssh root@seu-ip-do-droplet
```

### Passo 3: Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar Nginx (reverse proxy)
apt install -y nginx

# Instalar Git
apt install -y git
```

### Passo 4: Configurar Backend

```bash
# Criar diretório
mkdir -p /var/www/clinica
cd /var/www/clinica

# Clonar repositório (ou fazer upload)
git clone https://github.com/seu-usuario/seu-repositorio.git .

# Ou fazer upload via SCP:
# scp -r Clinica root@seu-ip:/var/www/clinica

# Instalar dependências do backend
cd backend
npm install

# Criar arquivo .env
nano .env
```

**Conteúdo do `.env`:**
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
PORT=3001
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_forte_aqui
JWT_EXPIRES_IN=7d
```

```bash
# Build do backend
npm run build

# Iniciar com PM2
pm2 start dist/main.js --name "clinica-backend"
pm2 save
pm2 startup
```

### Passo 5: Configurar Frontend

```bash
cd /var/www/clinica/frontend

# Instalar dependências
npm install

# Criar arquivo .env.production
nano .env.production
```

**Conteúdo do `.env.production`:**
```env
VITE_API_URL=http://seu-ip:3001
# Ou se tiver domínio:
# VITE_API_URL=https://api.seudominio.com
```

```bash
# Build do frontend
npm run build

# Os arquivos estarão em: /var/www/clinica/frontend/dist
```

### Passo 6: Configurar Nginx

```bash
# Criar configuração do Nginx
nano /etc/nginx/sites-available/clinica
```

**Configuração do Nginx:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.seudominio.com;  # Ou seu IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;  # Ou seu IP

    root /var/www/clinica/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker e Manifest
    location ~* (sw\.js|manifest\.webmanifest|registerSW\.js)$ {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

```bash
# Ativar configuração
ln -s /etc/nginx/sites-available/clinica /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### Passo 7: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seudominio.com -d www.seudominio.com
certbot --nginx -d api.seudominio.com

# Renovação automática
certbot renew --dry-run
```

### Passo 8: Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 🔧 Configurações Adicionais

### Atualizar CORS no Backend

No arquivo `Clinica/backend/src/main.ts`, atualize:

```typescript
app.enableCors({
  origin: [
    'https://seudominio.com',
    'https://www.seudominio.com',
    'http://localhost:5173', // Para desenvolvimento local
    'http://localhost:4173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Atualizar URL da API no Frontend

No arquivo `Clinica/frontend/src/config.ts` ou `src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.seudominio.com';
```

### Configurar PWA para Produção

O PWA já está configurado! Apenas certifique-se de que:

1. Os ícones estão em `public/`
2. O manifest está correto
3. O service worker está funcionando
4. A URL de produção está em HTTPS

---

## 🔄 Atualizações Futuras

### Com App Platform:
- Push para Git = Deploy automático!

### Com Droplet:

```bash
# Conectar ao servidor
ssh root@seu-ip

# Atualizar código
cd /var/www/clinica
git pull

# Rebuild backend
cd backend
npm install
npm run build
pm2 restart clinica-backend

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Reiniciar Nginx
systemctl restart nginx
```

---

## 📊 Monitoramento

### PM2 Dashboard

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs clinica-backend

# Monitoramento
pm2 monit
```

### Nginx Logs

```bash
# Logs de acesso
tail -f /var/log/nginx/access.log

# Logs de erro
tail -f /var/log/nginx/error.log
```

---

## 🔒 Segurança

1. **Firewall**: Configure UFW
2. **SSL**: Use Let's Encrypt (gratuito)
3. **Senhas Fortes**: Use JWT_SECRET forte
4. **Variáveis de Ambiente**: Nunca commite `.env`
5. **Atualizações**: Mantenha sistema atualizado

---

## 💰 Custos Estimados

### App Platform:
- Backend: ~$12/mês
- Frontend: ~$0-5/mês (static site)
- **Total**: ~$12-17/mês

### Droplet:
- Droplet básico: ~$6/mês
- Domínio: ~$12/ano
- **Total**: ~$7/mês

---

## 🆘 Troubleshooting

### Backend não inicia:
```bash
pm2 logs clinica-backend
# Verificar variáveis de ambiente
# Verificar porta disponível
```

### Frontend não carrega:
```bash
# Verificar build
ls -la /var/www/clinica/frontend/dist

# Verificar Nginx
nginx -t
systemctl status nginx
```

### Erro 502 Bad Gateway:
- Backend não está rodando
- Porta incorreta no Nginx
- Firewall bloqueando

---

## ✅ Checklist de Deploy

- [ ] Repositório Git configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Backend buildado e rodando
- [ ] Frontend buildado
- [ ] Nginx configurado (se Droplet)
- [ ] SSL configurado
- [ ] CORS atualizado
- [ ] Domínio configurado
- [ ] Firewall configurado
- [ ] PM2 configurado (se Droplet)
- [ ] Testado em produção

---

## 🎉 Pronto!

Sua aplicação está no ar! 🚀

**URLs:**
- Frontend: `https://seudominio.com`
- Backend API: `https://api.seudominio.com`
- Swagger: `https://api.seudominio.com/api`

se