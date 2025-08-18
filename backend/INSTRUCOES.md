# 🚀 Instruções Rápidas - Backend

## ✅ Configuração Concluída

O backend já está configurado com suas credenciais do Supabase:
- **URL**: https://hszzeqafyslpqxqomddu.supabase.co
- **Chave Anônima**: Configurada
- **Chave de Serviço**: Configurada

## 🏃‍♂️ Como Executar

### ⚠️ PRÉ-REQUISITOS OBRIGATÓRIOS:
1. **Node.js** - Baixe em: https://nodejs.org/ (versão LTS)
2. **Reinicie o terminal** após instalar o Node.js

### Opção 1: Setup Completo (Recomendado para primeira vez)
```bash
# Execute o script de setup completo
.\setup-completo.bat
```

### Opção 2: Script Automático (Windows)
```bash
# Execute o arquivo install-and-run.bat
.\install-and-run.bat
```

### Opção 2: Comandos Manuais
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run start:dev
```

### Opção 3: Versão Simplificada (se houver problemas)
Se continuar com erros de dependências:
```bash
# Use o package.json simplificado
copy package-simple.json package.json
npm install
npm run start:dev
```

## 🌐 Endpoints Disponíveis

Após executar, a API estará disponível em:
- **API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api
- **Teste Supabase**: http://localhost:3001/test-supabase

## 📋 Módulos Implementados

- ✅ **Autenticação** (`/auth`) - Login, registro, logout
- ✅ **Pacientes** (`/patients`) - CRUD completo
- ✅ **Consultas** (`/appointments`) - CRUD completo
- ✅ **Avaliações** (`/evaluations`) - CRUD completo
- ✅ **Supabase** - Conexão configurada

## 🔧 Estrutura do Banco

O backend está configurado para trabalhar com as seguintes tabelas:
- `patients` - Informações dos pacientes
- `appointments` - Consultas agendadas
- `evaluations` - Avaliações médicas
- `users` - Usuários do sistema (via Supabase Auth)

## 🚨 Solução de Problemas

### Erro de Dependências (tsconfig-paths)
Se aparecer erro com `tsconfig-paths` ou outras dependências:
```bash
# Execute o script de instalação limpa
install-clean.bat

# Ou manualmente:
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Erro de Conexão
Se houver erro de conexão:
1. Verifique se o Supabase está ativo
2. Teste a conexão em: `/test-supabase`
3. Verifique as credenciais no arquivo `config.ts`

## 📞 Suporte

Para dúvidas, consulte o `README.md` completo ou entre em contato.
