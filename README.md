# 🦷 Sistema de Gestão para Clínicas Odontológicas

Sistema completo de gestão odontológica desenvolvido com **NestJS**, **React** e **Supabase**.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [API Documentation](#api-documentation)
- [Contribuindo](#contribuindo)

## ✨ Características


- 📅 **Gestão de Agenda** - Agendamento e controle de consultas
- 👥 **Gestão de Pacientes** - CRUD completo com histórico
- 💼 **Catálogo de Procedimentos** - Gestão de procedimentos odontológicos
- 💰 **Orçamentos** - Criação e acompanhamento de orçamentos
- 📝 **Anamnese Digital** - Fichas de anamnese completas
- 📊 **Planos de Tratamento** - Planejamento e acompanhamento
- 🔄 **Gestão de Retornos** - Controle de retornos de pacientes
- 📁 **Gestão de Arquivos** - Upload de raio-x, documentos, etc.
- 🤖 **Chatbot** - Atendimento automatizado
- 📈 **Relatórios** - Dashboards e relatórios gerenciais
- 🔔 **Notificações** - Sistema de notificações em tempo real
- 🌙 **Modo Escuro** - Interface adaptável
- 📱 **Design Responsivo** - Funciona em todos os dispositivos

## 🛠️ Tecnologias

### Backend
- [NestJS](https://nestjs.com/) - Framework Node.js progressivo
- [Supabase](https://supabase.com/) - Backend as a Service (PostgreSQL)
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript tipado
- [Swagger](https://swagger.io/) - Documentação de API

### Frontend
- [React 18](https://react.dev/) - Biblioteca para interfaces
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Vite](https://vitejs.dev/) - Build tool moderna
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS utility-first
- [React Router](https://reactrouter.com/) - Roteamento
- [Lucide React](https://lucide.dev/) - Ícones
- [Recharts](https://recharts.org/) - Gráficos

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Conta no [Supabase](https://supabase.com/) (gratuita)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd clinica
```

### 2. Instale as dependências do Backend

```bash
cd Clinica/backend
npm install
```

### 3. Instale as dependências do Frontend

```bash
cd Clinica/frontend
npm install
```

## ⚙️ Configuração

### Backend

1. Crie um arquivo `.env` na pasta `Clinica/backend`:

```bash
cp env.example .env
```

2. Configure as variáveis de ambiente no `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-key
SUPABASE_SERVICE_KEY=sua-service-role-key

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration (opcional)
JWT_SECRET=seu-secret-jwt
```

3. Para obter as credenciais do Supabase:
   - Acesse [app.supabase.com](https://app.supabase.com)
   - Crie um novo projeto
   - Vá em **Settings** → **API**
   - Copie a **URL** e a **anon key**

### Frontend

1. Configure a URL da API em `Clinica/frontend/src/config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:3001';
```

### Banco de Dados

Execute os scripts SQL no Supabase para criar as tabelas necessárias. Os tipos estão definidos em `backend/src/types/database.ts`.

#### Tabelas principais:
- `clientelA` (pacientes)
- `usuarios`
- `empresa`
- `consultas`
- `procedimentos`
- `orcamentos`
- `plano_tratamento`
- `anamnese`
- E outras...

## 🎯 Executando o Projeto

### Backend (Terminal 1)

```bash
cd Clinica/backend
npm run start:dev
```

O backend estará disponível em: **http://localhost:3001**

### Frontend (Terminal 2)

```bash
cd Clinica/frontend
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### Acessar o Sistema

1. Abra o navegador em `http://localhost:5173`
2. Faça login ou registre uma nova conta
3. Comece a usar o sistema!

## 📁 Estrutura do Projeto

```
Clinica/
├── backend/
│   ├── src/
│   │   ├── anamnese/
│   │   ├── annotations/
│   │   ├── appointments/
│   │   ├── auth/
│   │   ├── budgets/
│   │   ├── business-hours/
│   │   ├── chatbot/
│   │   ├── empresas/
│   │   ├── evaluations/
│   │   ├── files/
│   │   ├── notifications/
│   │   ├── patients/
│   │   ├── procedures/        # NOVO!
│   │   ├── returns/
│   │   ├── subscriptions/
│   │   ├── supabase/
│   │   ├── treatment-plans/
│   │   ├── types/
│   │   ├── usuarios/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   ├── Patients/
│   │   │   ├── UI/
│   │   │   └── ...
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Pacientes.tsx
│   │   │   ├── Procedimentos.tsx  # NOVO!
│   │   │   ├── Agenda.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── STATUS-DO-PROJETO.md
└── README.md
```

## 🎨 Funcionalidades

### Módulo de Procedimentos (Novo!)

#### Backend
- ✅ CRUD completo de procedimentos
- ✅ Filtros por categoria e status
- ✅ Listagem de categorias
- ✅ Soft delete (desativação)
- ✅ Validação de dados com DTOs

#### Frontend
- ✅ Interface intuitiva com cards
- ✅ Busca em tempo real
- ✅ Filtros por categoria
- ✅ Modal de criação/edição
- ✅ Formatação de valores monetários
- ✅ Formatação de tempo
- ✅ Modo escuro
- ✅ Design responsivo

#### Campos do Procedimento
- Nome do procedimento
- Descrição
- Categoria (ex: Preventivo, Estético, Cirúrgico)
- Valor estimado (R$)
- Tempo estimado (minutos)
- Status (ativo/inativo)
- Observações

### Outros Módulos

- **Dashboard**: Visão geral com métricas importantes
- **Agenda**: Calendário de consultas com filtros
- **Pacientes**: Gestão completa com anamnese, arquivos e timeline
- **Orçamentos**: Criação de orçamentos detalhados
- **Retornos**: Agendamento de retornos
- **Planos de Tratamento**: Planejamento de procedimentos
- **Relatórios**: Análises e relatórios gerenciais
- **Configurações**: Personalização do sistema

## 📚 API Documentation

Com o backend rodando, acesse a documentação Swagger em:

```
http://localhost:3001/docs
```

### Principais Endpoints de Procedimentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/procedures` | Listar procedimentos |
| GET | `/procedures/:id` | Buscar por ID |
| GET | `/procedures/categorias` | Listar categorias |
| POST | `/procedures` | Criar procedimento |
| PUT | `/procedures/:id` | Atualizar procedimento |
| DELETE | `/procedures/:id` | Desativar procedimento |

## 🧪 Testes

### Backend
```bash
cd Clinica/backend
npm run test
```

### Frontend
```bash
cd Clinica/frontend
npm run test
```

## 📝 Scripts Disponíveis

### Backend
- `npm run start` - Inicia o servidor
- `npm run start:dev` - Inicia em modo desenvolvimento (hot reload)
- `npm run build` - Compila o TypeScript
- `npm run start:prod` - Inicia em produção

### Frontend
- `npm run dev` - Inicia em desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa o linter

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Desenvolvedor Principal - [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Time NestJS
- Time React
- Comunidade Supabase
- Todos os contribuidores

## 📞 Suporte

Para suporte, envie um email para suporte@clinica.com ou abra uma issue no GitHub.

---

**Feito com ❤️ para facilitar a gestão de clínicas odontológicas**
