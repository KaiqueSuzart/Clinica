# Módulo de Planos de Tratamento

Este módulo gerencia os planos de tratamento dos pacientes na clínica odontológica.

## Funcionalidades

- ✅ **CRUD completo** de planos de tratamento
- ✅ **Gestão de itens** individuais do plano
- ✅ **Controle de status** dos procedimentos
- ✅ **Cálculo automático** de progresso e custos
- ✅ **Busca por paciente** e análise de progresso
- ✅ **Validação de dados** com DTOs
- ✅ **Autenticação JWT** obrigatória

## Estrutura do Banco de Dados

### Tabela `treatment_plans`
- `id` - UUID único do plano
- `patientId` - Referência ao paciente
- `title` - Título do plano
- `description` - Descrição detalhada
- `totalCost` - Custo total calculado automaticamente
- `progress` - Progresso em porcentagem (0-100)
- `createdAt` - Data de criação
- `updatedAt` - Data da última atualização

### Tabela `treatment_plan_items`
- `id` - UUID único do item
- `treatmentPlanId` - Referência ao plano
- `procedure` - Nome do procedimento
- `description` - Descrição detalhada
- `tooth` - Dente específico (opcional)
- `priority` - Prioridade (alta, media, baixa)
- `estimatedCost` - Custo estimado
- `estimatedSessions` - Número de sessões estimadas
- `status` - Status atual (planejado, em_andamento, concluido, cancelado)
- `startDate` - Data de início (quando em andamento)
- `completionDate` - Data de conclusão
- `notes` - Observações adicionais
- `order` - Ordem de execução
- `createdAt` - Data de criação
- `updatedAt` - Data da última atualização

## Endpoints da API

### Base: `/treatment-plans`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/` | Criar novo plano de tratamento |
| `GET` | `/` | Listar todos os planos |
| `GET` | `/patient/:patientId` | Buscar planos de um paciente |
| `GET` | `/patient/:patientId/progress` | Progresso do tratamento do paciente |
| `GET` | `/:id` | Buscar plano específico |
| `PATCH` | `/:id` | Atualizar plano |
| `PATCH` | `/:planId/items/:itemId/status` | Atualizar status de um item |
| `DELETE` | `/:id` | Remover plano |

## Exemplos de Uso

### Criar Plano de Tratamento

```json
POST /treatment-plans
{
  "patientId": "uuid-do-paciente",
  "title": "Plano Ortodôntico",
  "description": "Tratamento completo de ortodontia",
  "items": [
    {
      "procedure": "Ortodontia",
      "description": "Avaliação inicial",
      "priority": "alta",
      "estimatedCost": 150.00,
      "estimatedSessions": 1,
      "status": "planejado",
      "notes": "Primeira consulta",
      "order": 1
    }
  ]
}
```

### Atualizar Status de Item

```json
PATCH /treatment-plans/plan-id/items/item-id/status
{
  "status": "concluido"
}
```

## Triggers Automáticos

O sistema possui triggers que:

1. **Atualizam timestamps** automaticamente
2. **Recalculam progresso** quando itens são modificados
3. **Recalculam custo total** quando itens são modificados

## Validações

- ✅ Campos obrigatórios validados
- ✅ Enums para status e prioridade
- ✅ Validação de tipos de dados
- ✅ Validação de relacionamentos

## Segurança

- 🔒 **JWT Authentication** obrigatória em todos os endpoints
- 🔒 **Validação de entrada** com class-validator
- 🔒 **Sanitização de dados** antes de salvar no banco

## Dependências

- `@nestjs/common` - Framework base
- `@nestjs/mapped-types` - Para DTOs de atualização
- `class-validator` - Validação de dados
- `class-transformer` - Transformação de dados
- `supabase` - Banco de dados

## Como Usar

1. **Importe o módulo** no `AppModule`
2. **Execute o SQL** para criar as tabelas
3. **Use os endpoints** com autenticação JWT
4. **Consulte os exemplos** no arquivo `examples/treatment-plans-api-examples.http`

## Próximos Passos

- [ ] Implementar notificações de progresso
- [ ] Adicionar relatórios de tratamento
- [ ] Integrar com sistema de agendamento
- [ ] Adicionar histórico de alterações
- [ ] Implementar backup automático
