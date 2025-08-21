# Configuração dos Planos de Tratamento

## Passos para Configurar

### 1. Executar o Script SQL

Execute o arquivo `supabase-treatment-plans-tables.sql` no seu banco Supabase:

```sql
-- Copie e cole o conteúdo do arquivo supabase-treatment-plans-tables.sql
-- Execute no SQL Editor do Supabase
```

### 2. Verificar as Tabelas Criadas

Após executar o SQL, você deve ter:

- ✅ `treatment_plans` - Tabela principal dos planos
- ✅ `treatment_plan_items` - Tabela dos itens do plano
- ✅ Índices para performance
- ✅ Triggers automáticos
- ✅ Funções de cálculo

### 3. Testar a API

Use o arquivo `examples/treatment-plans-api-examples.http` para testar:

```bash
# Instalar extensão REST Client no VS Code
# Ou usar Postman/Insomnia

# Testar criação de plano
POST http://localhost:3000/treatment-plans

# Testar busca de planos
GET http://localhost:3000/treatment-plans
```

### 4. Estrutura das Tabelas

#### `treatment_plans`
```sql
id: UUID (PK)
patientId: UUID (FK -> clientelA.id)
title: TEXT
description: TEXT
totalCost: DECIMAL(10,2)
progress: INTEGER (0-100)
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

#### `treatment_plan_items`
```sql
id: UUID (PK)
treatmentPlanId: UUID (FK -> treatment_plans.id)
procedure: TEXT
description: TEXT
tooth: TEXT
priority: TEXT (alta/media/baixa)
estimatedCost: DECIMAL(10,2)
estimatedSessions: INTEGER
status: TEXT (planejado/em_andamento/concluido/cancelado)
startDate: TIMESTAMP
completionDate: TIMESTAMP
notes: TEXT
order_index: INTEGER
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

### 5. Funcionalidades Automáticas

O sistema possui:

- 🔄 **Triggers** para atualizar timestamps
- 📊 **Cálculo automático** de progresso
- 💰 **Cálculo automático** de custo total
- 🔗 **Integridade referencial** com pacientes

### 6. Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/treatment-plans` | Criar plano |
| `GET` | `/treatment-plans` | Listar todos |
| `GET` | `/treatment-plans/patient/:id` | Por paciente |
| `GET` | `/treatment-plans/:id` | Plano específico |
| `PATCH` | `/treatment-plans/:id` | Atualizar |
| `DELETE` | `/treatment-plans/:id` | Remover |
| `PATCH` | `/treatment-plans/:id/items/:itemId/status` | Status do item |

### 7. Exemplo de Dados

```json
{
  "patientId": "uuid-do-paciente",
  "title": "Plano Ortodôntico",
  "description": "Tratamento completo",
  "items": [
    {
      "procedure": "Ortodontia",
      "description": "Avaliação inicial",
      "priority": "alta",
      "estimatedCost": 150.00,
      "estimatedSessions": 1,
      "status": "planejado",
      "order": 1
    }
  ]
}
```

### 8. Verificações

✅ **Compilação**: `npm run build`  
✅ **Tabelas**: Criadas no Supabase  
✅ **API**: Endpoints funcionando  
✅ **Validação**: DTOs funcionando  
✅ **Relacionamentos**: Chaves estrangeiras  

### 9. Próximos Passos

1. **Testar** todos os endpoints
2. **Integrar** com o frontend
3. **Configurar** autenticação JWT
4. **Adicionar** logs e monitoramento
5. **Implementar** testes automatizados

## Suporte

Se encontrar problemas:

1. Verifique os logs do NestJS
2. Confirme as tabelas no Supabase
3. Teste com dados simples primeiro
4. Verifique as permissões do banco
