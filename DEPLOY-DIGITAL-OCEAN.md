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
4. Selecione o repositório e branch

### Passo 3: Configurar Backend

1. **Detectar Componente:**
   - Digital Ocean detecta automaticamente o backend
   - Se não detectar, adicione manualmente:
     - **Type**: Web Service
     - **Source Directory**: `backend`
     - **Build Command**: `npm install && npm run build`
     - **Run Command**: `npm run start:prod`
     - **HTTP Port**: `3001`

2. **Variáveis de Ambiente:**
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=seu_jwt_secret_forte_aqui
   JWT_EXPIRES_IN=7d
   ```

3. **Configurar CORS:**
   - Adicione a URL do frontend nas variáveis de ambiente
   - Ou configure no código (ver abaixo)

### Passo 4: Configurar Frontend

1. **Adicionar Componente:**
   - Clique em **"Add Component"**
   - **Type**: Static Site
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

2. **Variáveis de Ambiente:**
   ```
   VITE_API_URL=https://seu-backend.ondigitalocean.app
   ```

### Passo 5: Configurar Domínio

1. No App Platform, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções
4. SSL será configurado automaticamente

### Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy
3. Acesse sua aplicação!

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

