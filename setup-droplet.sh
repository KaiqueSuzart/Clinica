#!/bin/bash

# Script de setup inicial para Digital Ocean Droplet
# Execute como root: bash setup-droplet.sh

set -e

echo "🚀 Configurando servidor Digital Ocean..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Atualizar sistema
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
apt update && apt upgrade -y

# 2. Instalar Node.js 18
echo -e "${YELLOW}📦 Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. Instalar PM2
echo -e "${YELLOW}📦 Instalando PM2...${NC}"
npm install -g pm2

# 4. Instalar Nginx
echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
apt install -y nginx

# 5. Instalar Git
echo -e "${YELLOW}📦 Instalando Git...${NC}"
apt install -y git

# 6. Instalar Certbot (SSL)
echo -e "${YELLOW}📦 Instalando Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# 7. Configurar Firewall
echo -e "${YELLOW}🔥 Configurando Firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 8. Criar diretório do projeto
echo -e "${YELLOW}📁 Criando diretórios...${NC}"
mkdir -p /var/www/clinica
mkdir -p /var/www/clinica/backend/logs

# 9. Configurar PM2 para iniciar no boot
echo -e "${YELLOW}⚙️ Configurando PM2...${NC}"
pm2 startup

echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Clone seu repositório em /var/www/clinica"
echo "2. Configure o arquivo .env no backend"
echo "3. Execute: cd /var/www/clinica/backend && npm install && npm run build"
echo "4. Execute: pm2 start ecosystem.config.js"
echo "5. Configure o Nginx (veja DEPLOY-DIGITAL-OCEAN.md)"
echo "6. Configure SSL com: certbot --nginx -d seudominio.com"

