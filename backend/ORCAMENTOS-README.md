# Sistema de Orçamentos - Clínica Odontológica

## Visão Geral

O sistema de orçamentos permite criar, gerenciar e acompanhar orçamentos para tratamentos odontológicos. Os orçamentos são compostos por itens individuais e podem incluir descontos e formas de pagamento.

## Estrutura do Banco de Dados

### Tabela `orcamentos`
- `id`: UUID único do orçamento
- `cliente_id`: ID do paciente (FK para clientelA)
- `dentista_id`: ID do dentista responsável (FK para usuarios)
- `descricao`: Descrição geral do orçamento
- `valor_total`: Valor total antes do desconto
- `desconto`: Valor do desconto aplicado
- `valor_final`: Valor final após desconto
- `status`: Status do orçamento (rascunho, enviado, aprovado, recusado, cancelado)
- `data_validade`: Data limite para validade do orçamento
- `observacoes`: Observações adicionais
- `forma_pagamento`: Forma de pagamento (dinheiro, cartao, pix, etc.)
- `parcelas`: Número de parcelas (1-60)

### Tabela `itens_orcamento`
- `id`: UUID único do item
- `orcamento_id`: ID do orçamento (FK para orcamentos)
- `descricao`: Descrição do procedimento/item
- `quantidade`: Quantidade do item
- `valor_unitario`: Valor unitário do item
- `valor_total`: Valor total do item (quantidade × valor_unitario)
- `observacoes`: Observações específicas do item

## API Endpoints

### GET /budgets
Lista todos os orçamentos com dados do paciente.

### GET /budgets/:id
Busca um orçamento específico com seus itens.

### GET /budgets/patient/:patientId
Lista orçamentos de um paciente específico.

### POST /budgets
Cria um novo orçamento com seus itens.

**Body:**
```json
{
  "cliente_id": "string",
  "dentista_id": "string (opcional)",
  "descricao": "string (opcional)",
  "valor_total": "number",
  "desconto": "number (opcional)",
  "valor_final": "number",
  "status": "string (opcional, padrão: 'rascunho')",
  "data_validade": "string (ISO date)",
  "observacoes": "string (opcional)",
  "forma_pagamento": "string (opcional)",
  "parcelas": "number (opcional, padrão: 1)",
  "itens": [
    {
      "descricao": "string",
      "quantidade": "number",
      "valor_unitario": "number",
      "valor_total": "number",
      "observacoes": "string (opcional)"
    }
  ]
}
```

### PUT /budgets/:id
Atualiza um orçamento existente.

### PUT /budgets/:id/status?status=novo_status
Atualiza apenas o status do orçamento.

### DELETE /budgets/:id
Remove um orçamento e seus itens.

## Status dos Orçamentos

- **rascunho**: Orçamento em criação, ainda não finalizado
- **enviado**: Orçamento enviado para o paciente
- **aprovado**: Orçamento aprovado pelo paciente
- **recusado**: Orçamento recusado pelo paciente
- **cancelado**: Orçamento cancelado pela clínica

## Frontend

A página de orçamentos (`/orcamentos`) permite:

1. **Visualizar orçamentos**: Lista todos os orçamentos com filtros por status
2. **Criar orçamento**: Formulário para criar novos orçamentos
3. **Editar orçamento**: Modificar orçamentos existentes
4. **Enviar orçamento**: Atualizar status para "enviado"
5. **Gerenciar itens**: Adicionar/remover itens do orçamento
6. **Aplicar descontos**: Desconto percentual ou valor fixo

## Configuração

### 1. Executar o SQL de criação das tabelas
```bash
# Execute o arquivo supabase-budgets-tables.sql no Supabase
```

### 2. Instalar dependências do backend
```bash
cd backend
npm install
```

### 3. Executar o backend
```bash
npm run start:dev
```

### 4. Instalar dependências do frontend
```bash
cd frontend
npm install
```

### 5. Executar o frontend
```bash
npm run dev
```

## Exemplos de Uso

### Criar um orçamento simples
```javascript
const budgetData = {
  cliente_id: "1",
  descricao: "Limpeza e profilaxia",
  valor_total: 150.00,
  desconto: 0.00,
  valor_final: 150.00,
  status: "rascunho",
  data_validade: "2024-02-20",
  forma_pagamento: "dinheiro",
  parcelas: 1,
  itens: [
    {
      descricao: "Limpeza e profilaxia",
      quantidade: 1,
      valor_unitario: 150.00,
      valor_total: 150.00,
      observacoes: "Inclui aplicação de flúor"
    }
  ]
};

const budget = await apiService.createBudget(budgetData);
```

### Atualizar status do orçamento
```javascript
await apiService.updateBudgetStatus(budgetId, 'aprovado');
```

## Validações

- O valor final deve ser igual ao valor total menos o desconto
- A quantidade de itens deve ser maior que 0
- Os valores unitários e totais devem ser maiores ou iguais a 0
- O número de parcelas deve estar entre 1 e 60
- A data de validade deve ser uma data futura

## Segurança

- RLS (Row Level Security) habilitado nas tabelas
- Validação de dados no backend
- Sanitização de inputs
- Controle de acesso baseado em empresa

## Monitoramento

- Logs de criação, atualização e exclusão de orçamentos
- Auditoria de mudanças de status
- Relatórios de orçamentos por período
- Estatísticas de aprovação/recusa
