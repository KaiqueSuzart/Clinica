# ✅ Rotas Públicas Implementadas

## 📋 Resumo das Mudanças

Implementação do padrão `@Public()` para marcar rotas que não exigem autenticação JWT, resolvendo o problema onde a rota de login estava sendo bloqueada pelo `TenantMiddleware`.

## 🔧 Arquivos Modificados

### 1. **Novo arquivo: `src/auth/decorators/public.decorator.ts`**
   - Decorator `@Public()` usando `SetMetadata` do NestJS
   - Permite marcar rotas como públicas de forma declarativa

### 2. **Modificado: `src/auth/tenant.middleware.ts`**
   - Adicionada verificação de rotas públicas antes de exigir token
   - Lista de rotas públicas inclui:
     - `/auth/login` e `/api/auth/login`
     - `/auth/register` e `/api/auth/register`
     - `/auth/register-empresa` e `/api/auth/register-empresa`
     - `/auth/logout` e `/api/auth/logout`
   - Se a rota for pública, o middleware pula a autenticação automaticamente

### 3. **Modificado: `src/auth/auth.controller.ts`**
   - Adicionado `@Public()` nas rotas:
     - `POST /auth/login`
     - `POST /auth/register`
     - `POST /auth/register-empresa`

## 🎯 Como Funciona

1. **Decorator `@Public()`**: Marca rotas que não precisam de autenticação
2. **TenantMiddleware**: Verifica se a rota é pública antes de exigir token
3. **Dupla proteção**: 
   - Verificação por path (funciona mesmo sem decorator)
   - Decorator para uso futuro em outras rotas

## ✅ Rotas Públicas

As seguintes rotas **NÃO exigem** token JWT:

- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `POST /api/auth/register-empresa` ✅
- `POST /api/auth/logout` ✅

## 🔒 Rotas Protegidas

Todas as outras rotas continuam exigindo token JWT:

- `GET /api/auth/me` (requer token)
- `GET /api/patients` (requer token)
- `GET /api/appointments` (requer token)
- Todas as outras rotas da API (requem token)

## 🧪 Testes

### Teste Local
```bash
# Iniciar backend
cd backend
npm run start:dev

# Testar login sem token (deve funcionar)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha123"}'

# Testar rota protegida sem token (deve retornar 401)
curl http://localhost:3001/patients
```

### Teste em Produção
```bash
# Testar login sem token (deve funcionar)
curl -X POST https://clinione-b9cyb.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha123"}'

# Testar rota protegida sem token (deve retornar 401)
curl https://clinione-b9cyb.ondigitalocean.app/api/patients
```

## 📝 Uso Futuro

Para marcar outras rotas como públicas no futuro, basta adicionar o decorator:

```typescript
import { Public } from './decorators/public.decorator';

@Controller('example')
export class ExampleController {
  @Public()
  @Get('public-endpoint')
  publicEndpoint() {
    return { message: 'Esta rota é pública' };
  }

  @Get('protected-endpoint')
  protectedEndpoint() {
    return { message: 'Esta rota requer autenticação' };
  }
}
```

## 🔍 Verificação

Após o deploy, verifique:

1. ✅ `POST /api/auth/login` funciona sem token
2. ✅ `POST /api/auth/register` funciona sem token
3. ✅ `GET /api/auth/me` retorna 401 sem token
4. ✅ `GET /api/patients` retorna 401 sem token
5. ✅ Rotas protegidas continuam funcionando com token válido

