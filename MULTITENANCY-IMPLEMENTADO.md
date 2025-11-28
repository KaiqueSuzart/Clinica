# 🏢 Implementação de Multitenancy - Resumo

## ✅ O que foi implementado

### 1. Decorator para Extrair Empresa ID
Criado decorator `@EmpresaId()` em `backend/src/auth/decorators/empresa.decorator.ts` que extrai automaticamente o `empresa_id` do request após o middleware de autenticação.

### 2. Módulos Atualizados para Multitenancy

#### ✅ Patients (Pacientes)
- **Service**: Todos os métodos agora recebem `empresaId` e filtram por `empresa` (campo na tabela clientelA)
- **Controller**: Todos os endpoints usam `@EmpresaId()` decorator
- **Queries**: Todas as consultas incluem `.eq('empresa', empresaId)`
- **Inserções**: Incluem automaticamente `empresa: empresaId`

#### ✅ Appointments (Consultas)
- **Service**: Todos os métodos atualizados para filtrar por `empresa_id`
- **Controller**: Todos os endpoints atualizados
- **Queries**: Incluem `.eq('empresa_id', empresaId)`
- **Inserções**: Incluem `empresa_id: empresaId`

#### ✅ Procedures (Procedimentos)
- **Service**: Todos os métodos filtram por `empresa_id`
- **Controller**: Todos os endpoints atualizados
- **Queries**: Incluem `.eq('empresa_id', empresaId)`
- **Inserções**: Incluem `empresa_id: empresaId`

#### ✅ Budgets (Orçamentos)
- **Service**: Todos os métodos filtram por `empresa_id`
- **Controller**: Todos os endpoints atualizados
- **Queries**: Incluem `.eq('empresa_id', empresaId)`
- **Inserções**: Incluem `empresa_id: empresaId`

## 🔧 Como Funciona

### Fluxo de Autenticação
1. **TenantMiddleware** (`auth/tenant.middleware.ts`):
   - Extrai token do header Authorization
   - Busca usuário no banco
   - Adiciona `req.user` e `req.empresa` ao request
   - Configura contexto da empresa no Supabase

2. **Decorator @EmpresaId()**:
   - Extrai `empresa_id` de `request.user.empresa_id` ou `request.empresa.id`
   - Retorna null se não encontrado (deve lançar erro)

3. **Services**:
   - Recebem `empresaId` como parâmetro
   - Filtram todas as queries por `empresa_id`
   - Incluem `empresa_id` em todas as inserções

### Exemplo de Uso

```typescript
// Controller
@Get()
findAll(@EmpresaId() empresaId: string) {
  return this.service.findAll(empresaId);
}

// Service
async findAll(empresaId: string) {
  const { data } = await this.supabase
    .getClient()
    .from('tabela')
    .select('*')
    .eq('empresa_id', empresaId);
  return data;
}
```

## 📋 Módulos que AINDA PRECISAM ser atualizados

### Backend
- [ ] Returns (Retornos)
- [ ] Dashboard
- [ ] Reports (Relatórios)
- [ ] Anamnese
- [ ] Annotations
- [ ] Treatment Plans (Planos de Tratamento)
- [ ] Files (Arquivos)
- [ ] Evaluations (Avaliações)
- [ ] Business Hours (Horários de Funcionamento)
- [ ] Notifications (Notificações)
- [ ] Chatbot
- [ ] Subscriptions (Assinaturas)
- [ ] Usuarios
- [ ] Empresas

### Frontend
- [ ] Atualizar chamadas de API para não enviar empresa_id manualmente
- [ ] O token já contém a empresa, então não precisa enviar no body/query

## 🔐 Segurança

### Middleware de Tenant
O `TenantMiddleware` já está configurado no `app.module.ts` para aplicar em todas as rotas exceto:
- `/auth/login`
- `/auth/register`
- `/auth/register-empresa`
- `/auth/logout`
- Rotas de teste

### Validação
- Todos os serviços validam se `empresaId` foi fornecido
- Queries sempre filtram por `empresa_id` para garantir isolamento
- Updates e Deletes verificam `empresa_id` antes de executar

## 📝 Notas Importantes

1. **Campo empresa vs empresa_id**: 
   - Tabela `clientelA` usa campo `empresa` (string/int)
   - Outras tabelas usam `empresa_id` (UUID)
   - Verificar qual campo usar em cada tabela

2. **Tenant Guard**: 
   - Existe `TenantGuard` mas não está sendo usado em todos os controllers
   - Considerar aplicar globalmente ou em rotas específicas

3. **RLS (Row Level Security)**:
   - O banco já deve ter políticas RLS configuradas
   - O backend usa service role key, então RLS pode não ser necessário
   - Mas é uma camada extra de segurança

## 🚀 Próximos Passos

1. Atualizar módulos restantes seguindo o mesmo padrão
2. Adicionar testes para garantir isolamento de dados
3. Documentar no Swagger que todas as rotas são multitenant
4. Verificar se o frontend precisa de ajustes
5. Adicionar logs para auditoria de acesso entre empresas

## 📚 Referências

- Decorator Pattern: https://docs.nestjs.com/custom-decorators
- Middleware: https://docs.nestjs.com/middleware
- Multitenancy: https://en.wikipedia.org/wiki/Multitenancy

---

**Data de Implementação**: 2025-01-XX
**Status**: Em Progresso (4 módulos completos de ~17)

