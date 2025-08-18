# Backend da Clínica

Backend da aplicação de gerenciamento clínico desenvolvido com NestJS e integrado ao Supabase.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeScript** - Linguagem de programação tipada
- **Supabase** - Backend-as-a-Service com PostgreSQL
- **Swagger** - Documentação da API
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

## 🛠️ Instalação

1. **Clone o repositório e navegue para a pasta backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
```

4. **Edite o arquivo `.env` com suas credenciais do Supabase:**
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
PORT=3001
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
```

## 🏃‍♂️ Executando a aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar a aplicação, a documentação Swagger estará disponível em:
```
http://localhost:3001/api
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:

- **patients** - Informações dos pacientes
- **appointments** - Consultas agendadas
- **evaluations** - Avaliações médicas
- **users** - Usuários do sistema

## 🔐 Autenticação

O sistema utiliza autenticação JWT através do Supabase Auth.

### Endpoints de autenticação:
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout

## 📁 Estrutura do Projeto

```
src/
├── auth/           # Módulo de autenticação
├── patients/       # Módulo de pacientes
├── appointments/   # Módulo de consultas
├── evaluations/    # Módulo de avaliações
├── supabase/       # Configuração do Supabase
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:cov
```

## 📝 Scripts disponíveis

- `npm run start` - Iniciar aplicação
- `npm run start:dev` - Iniciar em modo desenvolvimento
- `npm run build` - Compilar aplicação
- `npm run lint` - Executar linter
- `npm run format` - Formatar código

## 🔧 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias
3. Copie as credenciais para o arquivo `.env`
4. Configure as políticas de segurança (RLS)

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

