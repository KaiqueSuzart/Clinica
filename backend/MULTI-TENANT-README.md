# Sistema Multi-Tenant - Autenticação e Isolamento de Dados

## Visão Geral

Este sistema implementa um modelo multi-tenant completo para clínicas odontológicas, garantindo que cada empresa tenha seus dados completamente isolados e seguros.

## Características Principais

### 🔐 Autenticação Multi-Tenant
- Login/registro com isolamento por empresa
- Registro de novas empresas com usuário administrador
- Troca de contexto entre empresas (para usuários com múltiplas empresas)
- Sessões seguras com tokens JWT

### 🏢 Isolamento de Dados
- Row Level Security (RLS) no Supabase
- Middleware automático para configuração de contexto
- Políticas de segurança por empresa
- Dados completamente isolados entre empresas

### 👥 Gestão de Usuários
- Diferentes níveis de acesso (admin, dentista, recepcionista, funcionário)
- Associação de usuários a empresas específicas
- Controle de permissões granular

## Arquitetura

### Backend (NestJS + Supabase)

```
src/
├── auth/
│   ├── auth.service.ts          # Lógica de autenticação
│   ├── auth.controller.ts       # Endpoints de auth
│   ├── tenant.middleware.ts     # Middleware de isolamento
│   └── tenant.guard.ts          # Guard de proteção
├── empresas/
│   ├── empresas.service.ts      # Gestão de empresas
│   ├── empresas.controller.ts   # Endpoints de empresas
│   └── empresas.module.ts       # Módulo de empresas
└── supabase/
    └── supabase-multi-tenant-auth.sql  # Script de configuração
```

### Frontend (React + TypeScript)

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthProvider.tsx     # Context de autenticação
│   │   ├── LoginForm.tsx        # Formulário de login
│   │   └── RegisterForm.tsx     # Formulário de registro
│   └── Layout/
│       └── Header.tsx           # Header com info do usuário/empresa
└── pages/
    └── LoginPage.tsx            # Página de login
```

## Configuração

### 1. Banco de Dados (Supabase)

Execute o script SQL para configurar as tabelas e políticas:

```sql
-- Execute no Supabase SQL Editor
\i supabase-multi-tenant-auth.sql
```

### 2. Backend

```bash
cd backend
npm install
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Uso da API

### Registro de Nova Empresa

```http
POST /auth/register-empresa
Content-Type: application/json

{
  "email": "admin@clinica.com",
  "password": "senha123",
  "nome": "Dr. João Silva",
  "cargo": "admin",
  "role": "admin",
  "nome_empresa": "Clínica Odontológica Exemplo",
  "email_empresa": "contato@clinica.com",
  "cnpj": "12.345.678/0001-90",
  "telefone_empresa": "(11) 99999-9999",
  "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@clinica.com",
  "password": "senha123"
}
```

### Registro de Usuário em Empresa Existente

```http
POST /auth/register
Content-Type: application/json

{
  "email": "dentista@clinica.com",
  "password": "senha123",
  "nome": "Dr. Maria Santos",
  "empresa_id": "uuid-da-empresa",
  "cargo": "dentista",
  "role": "dentista"
}
```

## Isolamento de Dados

### Como Funciona

1. **Middleware de Tenant**: Intercepta todas as requisições (exceto auth)
2. **Verificação de Token**: Valida o token JWT do Supabase
3. **Busca de Contexto**: Obtém dados do usuário e empresa
4. **Configuração RLS**: Define o contexto da empresa no Supabase
5. **Isolamento Automático**: Todas as consultas são automaticamente filtradas

### Políticas RLS

```sql
-- Exemplo de política para pacientes
CREATE POLICY "clientelA_empresa_policy" ON "clientelA"
  FOR ALL USING (empresa = current_setting('app.current_empresa_id')::TEXT);

-- Exemplo de política para consultas
CREATE POLICY "consultas_empresa_policy" ON consultas
  FOR ALL USING (empresa_id = current_setting('app.current_empresa_id')::UUID);
```

## Segurança

### ✅ Implementado
- Autenticação JWT via Supabase
- Row Level Security (RLS) no banco
- Middleware de isolamento automático
- Validação de permissões por empresa
- Tokens seguros com expiração

### 🔒 Boas Práticas
- Nunca expor dados entre empresas
- Validação de contexto em todas as operações
- Logs de auditoria por empresa
- Criptografia de dados sensíveis

## Estrutura de Dados

### Tabela `empresa`
```sql
CREATE TABLE empresa (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email_empresa VARCHAR(255) UNIQUE NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  telefone_empresa VARCHAR(20),
  endereco TEXT,
  logo_url TEXT,
  configuracoes JSONB,
  plano VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  auth_user_id UUID UNIQUE,  -- Referência ao Supabase Auth
  empresa_id UUID NOT NULL REFERENCES empresa(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cargo VARCHAR(100),
  role VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  permissoes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Frontend

### Uso do AuthProvider

```tsx
import { useAuth } from './components/Auth/AuthProvider';

function App() {
  const { user, empresa, login, logout, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  if (!user) return <LoginPage />;

  return (
    <div>
      <Header />
      <main>
        <h1>Bem-vindo, {user.nome}!</h1>
        <p>Empresa: {empresa?.nome}</p>
      </main>
    </div>
  );
}
```

### Componentes Disponíveis

- `LoginForm`: Formulário de login
- `RegisterForm`: Formulário de registro (usuário/empresa)
- `AuthProvider`: Context de autenticação
- `Header`: Header com informações do usuário/empresa

## Testes

### Teste de Isolamento

1. Crie duas empresas diferentes
2. Adicione usuários em cada empresa
3. Faça login com cada usuário
4. Verifique que os dados estão isolados

### Exemplo de Teste

```bash
# Empresa 1
curl -X POST http://localhost:3000/auth/register-empresa \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@empresa1.com","password":"123","nome":"Admin 1","nome_empresa":"Empresa 1","email_empresa":"contato@empresa1.com"}'

# Empresa 2  
curl -X POST http://localhost:3000/auth/register-empresa \
  -H "Content-Type: application/json" \
  -d '{"email":"admin2@empresa2.com","password":"123","nome":"Admin 2","nome_empresa":"Empresa 2","email_empresa":"contato@empresa2.com"}'

# Login e verificar isolamento
curl -X GET http://localhost:3000/patients \
  -H "Authorization: Bearer TOKEN_EMPRESA_1"
# Deve retornar apenas pacientes da Empresa 1
```

## Troubleshooting

### Problemas Comuns

1. **Erro de RLS**: Verifique se as políticas estão criadas corretamente
2. **Token inválido**: Verifique se o token está sendo enviado corretamente
3. **Dados cruzados**: Verifique se o middleware está configurado corretamente
4. **Erro de contexto**: Verifique se a função `set_config` está funcionando

### Logs Úteis

```sql
-- Verificar configuração atual
SELECT current_setting('app.current_empresa_id');

-- Verificar políticas RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('empresa', 'usuarios', 'clientelA');
```

## Próximos Passos

- [ ] Implementar auditoria de logs
- [ ] Adicionar recuperação de senha
- [ ] Implementar 2FA
- [ ] Adicionar dashboard de estatísticas
- [ ] Implementar backup automático por empresa
- [ ] Adicionar notificações em tempo real

## Suporte

Para dúvidas ou problemas, verifique:
1. Logs do backend
2. Console do navegador
3. Logs do Supabase
4. Documentação da API

