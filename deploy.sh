#!/bin/bash

# Script de deploy para Digital Ocean Droplet
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/clinica"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# 1. Atualizar código
echo -e "${YELLOW}📥 Atualizando código do Git...${NC}"
cd $PROJECT_DIR
git pull origin main

# 2. Backend
echo -e "${YELLOW}🔧 Buildando backend...${NC}"
cd $BACKEND_DIR
npm install --production
npm run build

# 3. Frontend
echo -e "${YELLOW}🎨 Buildando frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

# 4. Reiniciar backend
echo -e "${YELLOW}🔄 Reiniciando backend...${NC}"
pm2 restart clinica-backend

# 5. Reiniciar Nginx
echo -e "${YELLOW}🌐 Reiniciando Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"


