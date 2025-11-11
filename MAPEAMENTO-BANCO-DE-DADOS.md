# 🗄️ Mapeamento Completo do Banco de Dados

## 📊 Configuração do Supabase

**URL:** `https://hszzeqafyslpqxqomddu.supabase.co`

## 📋 Tabelas Implementadas

### 1. **clientelA** (Pacientes)
Tabela principal de pacientes da clínica.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID/int4 | ID único do paciente |
| `nome` | string | Nome completo |
| `telefone` | string | Telefone de contato |
| `empresa` | string/int | ID da empresa |
| `inativa` | boolean | Se o cadastro está inativo |
| `email` | string | E-mail |
| `cpf` | string | CPF |
| `data_nascimento` | date | Data de nascimento |
| `observacoes` | text | Observações gerais |
| `status` | string | Status do paciente |
| `ultima_visita` | timestamp | Data da última consulta |
| `proximo_retorno` | date | Próximo retorno agendado |
| `responsavel_nome` | string | Nome do responsável (para menores) |
| `responsavel_telefone` | string | Telefone do responsável |
| `responsavel_parentesco` | string | Grau de parentesco |
| `address` | string | Endereço |
| `emergency_contact_name` | string | Contato de emergência |
| `emergency_contact_tel` | string | Telefone de emergência |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Relacionamentos:**
- → `empresa` (empresa.id)
- ← `consultas` (via cliente_id)
- ← `anamnese` (via cliente_id)
- ← `procedimentos` (via cliente_id)

---

### 2. **usuarios** (Usuários do Sistema)
Usuários que acessam o sistema (dentistas, recepcionistas, etc.).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do usuário |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `nome` | string | Nome completo |
| `email` | string | E-mail (login) |
| `telefone` | string | Telefone |
| `cargo` | string | Cargo/função |
| `avatar_url` | string | URL do avatar |
| `ativo` | boolean | Se está ativo |
| `permissoes` | json | Permissões do usuário |
| `ultimo_login` | timestamp | Último acesso |

**Relacionamentos:**
- → `empresa` (empresa.id)
- ← `consultas` (via dentista_id)
- ← `notas_cliente` (via usuario_id)

---

### 3. **empresa** (Dados da Clínica)
Informações da clínica/empresa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da empresa |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `nome` | string | Nome da empresa |
| `telefone_empresa` | string | Telefone principal |
| `inativa` | boolean | Se está inativa |
| `email_empresa` | string | E-mail da empresa |
| `endereco` | string | Endereço completo |
| `cnpj` | string | CNPJ |
| `logo_url` | string | URL do logo |
| `configuracoes` | json | Configurações gerais |

**Relacionamentos:**
- ← `usuarios` (via empresa_id)
- ← `consultas` (via empresa_id)
- ← Todas as tabelas principais

---

### 4. **consultas** (Agendamentos)
Consultas agendadas e realizadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da consulta |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `cliente_id` | UUID | ID do paciente |
| `dentista_id` | UUID | ID do profissional |
| `data_consulta` | date | Data da consulta |
| `hora_inicio` | time | Horário de início |
| `duracao_minutos` | int | Duração em minutos |
| `tipo_consulta` | string | Tipo (avaliação, retorno, etc) |
| `procedimento` | string | Procedimento realizado |
| `observacoes` | text | Observações |
| `status` | string | Status (pendente, confirmado, realizado, cancelado) |
| `valor` | decimal | Valor da consulta |
| `forma_pagamento` | string | Forma de pagamento |
| `pago` | boolean | Se foi pago |

**Relacionamentos:**
- → `empresa` (empresa.id)
- → `clientelA` (cliente_id)
- → `usuarios` (dentista_id)
- ← `retornos` (via consulta_original_id)

---

### 5. **retornos** (Retornos Agendados)
Retornos de pacientes após consultas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do retorno |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `cliente_id` | UUID | ID do paciente |
| `consulta_original_id` | UUID | ID da consulta original |
| `data_retorno` | date | Data do retorno |
| `hora_retorno` | time | Horário do retorno |
| `motivo` | string | Motivo do retorno |
| `procedimento` | string | Procedimento a realizar |
| `status` | string | Status (agendado, confirmado, realizado) |
| `observacoes` | text | Observações |

**Relacionamentos:**
- → `empresa` (empresa.id)
- → `clientelA` (cliente_id)
- → `consultas` (consulta_original_id)

---

### 6. **procedimentos** (Catálogo de Procedimentos) ⭐ NOVO
Catálogo de procedimentos odontológicos oferecidos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do procedimento |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `cliente_id` | UUID | ID do cliente (se aplicável) |
| `consulta_id` | UUID | ID da consulta (se aplicável) |
| `nome` | string | Nome do procedimento |
| `descricao` | text | Descrição detalhada |
| `categoria` | string | Categoria (Preventivo, Estético, etc) |
| `valor_estimado` | decimal | Valor estimado em R$ |
| `tempo_estimado` | int | Tempo estimado em minutos |
| `ativo` | boolean | Se está ativo no catálogo |
| `observacoes` | text | Observações adicionais |
| `data_procedimento` | date | Data de realização (histórico) |
| `dentista_id` | UUID | ID do dentista (histórico) |
| `custo` | decimal | Custo real (histórico) |
| `status` | string | Status (histórico) |

**Uso Duplo:**
- Catálogo: `cliente_id = null` → Procedimentos disponíveis
- Histórico: `cliente_id != null` → Procedimentos realizados

**Categorias Comuns:**
- Preventivo (Limpeza, Flúor, etc)
- Estético (Clareamento, Facetas, etc)
- Cirúrgico (Extração, Implante, etc)
- Restaurador (Obturação, Coroa, etc)
- Ortodôntico (Aparelho, Manutenção, etc)

---

### 7. **orcamentos** (Orçamentos)
Orçamentos criados para pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do orçamento |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `cliente_id` | UUID | ID do paciente |
| `dentista_id` | UUID | ID do profissional |
| `descricao` | text | Descrição geral |
| `valor_total` | decimal | Valor total |
| `desconto` | decimal | Desconto aplicado |
| `tipo_desconto` | string | Tipo (percentual, valor) |
| `valor_final` | decimal | Valor final |
| `status` | string | Status (pendente, aprovado, recusado) |
| `data_validade` | date | Validade do orçamento |
| `observacoes` | text | Observações |
| `forma_pagamento` | string | Forma de pagamento |
| `parcelas` | int | Número de parcelas |

**Relacionamentos:**
- → `empresa` (empresa.id)
- → `clientelA` (cliente_id)
- → `usuarios` (dentista_id)
- ← `itens_orcamento` (via orcamento_id)

---

### 8. **itens_orcamento** (Itens do Orçamento)
Itens individuais de cada orçamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do item |
| `orcamento_id` | UUID | ID do orçamento |
| `descricao` | string | Descrição do item |
| `quantidade` | int | Quantidade |
| `valor_unitario` | decimal | Valor unitário |
| `valor_total` | decimal | Valor total |
| `observacoes` | text | Observações |

**Relacionamentos:**
- → `orcamentos` (orcamento_id)

---

### 9. **plano_tratamento** (Planos de Tratamento)
Planos de tratamento dos pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do plano |
| `paciente_id` | UUID | ID do paciente |
| `titulo` | string | Título do plano |
| `descricao` | text | Descrição |
| `custo_total` | decimal | Custo total estimado |
| `progresso` | int | Progresso (0-100) |
| `status` | string | Status do plano |
| `observacoes` | text | Observações |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Relacionamentos:**
- → `clientelA` (paciente_id)
- ← `itens_plano_tratamento` (via plano_id)

---

### 10. **itens_plano_tratamento** (Itens do Plano)
Procedimentos incluídos no plano de tratamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do item |
| `plano_id` | UUID | ID do plano |
| `procedimento` | string | Nome do procedimento |
| `descricao` | text | Descrição |
| `dente` | string | Dente específico |
| `prioridade` | enum | Prioridade (alta, media, baixa) |
| `custo_estimado` | decimal | Custo estimado |
| `sessoes_estimadas` | int | Número de sessões |
| `status` | enum | Status (planejado, em_andamento, concluido, cancelado) |
| `data_inicio` | date | Data de início |
| `data_conclusao` | date | Data de conclusão |
| `observacoes` | text | Observações |
| `ordem` | int | Ordem de execução |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Relacionamentos:**
- → `plano_tratamento` (plano_id)
- ← `treatment_sessions` (via treatment_item_id)

---

### 11. **treatment_sessions** (Sessões de Tratamento)
Sessões individuais de cada procedimento do plano.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da sessão |
| `treatment_item_id` | UUID | ID do item do plano |
| `session_number` | int | Número da sessão |
| `date` | date | Data da sessão |
| `description` | text | Descrição |
| `completed` | boolean | Se foi concluída |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Relacionamentos:**
- → `itens_plano_tratamento` (treatment_item_id)

---

### 12. **anamnese** (Fichas de Anamnese)
Histórico médico e odontológico dos pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da anamnese |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `cliente_id` | UUID | ID do paciente |
| `alergias` | text | Alergias |
| `medicamentos_uso` | text | Medicamentos em uso |
| `historico_medico` | text | Histórico médico |
| `historico_odonto` | text | Histórico odontológico |
| `habitos` | text | Hábitos |
| `queixa_principal` | text | Queixa principal |
| `consentimento` | boolean | Consentimento assinado |
| `data_consentimento` | date | Data do consentimento |
| `diabetes` | boolean | Tem diabetes |
| `diabetes_notes` | text | Notas sobre diabetes |
| `hipertension` | boolean | Tem hipertensão |
| `hipertension_notes` | text | Notas sobre hipertensão |
| `heart_problems` | boolean | Problemas cardíacos |
| `heart_problems_notes` | text | Notas sobre coração |
| `pregnant` | boolean | Está grávida |
| `pregnant_notes` | text | Notas sobre gravidez |
| `smoking` | boolean | Fuma |
| `smoking_notes` | text | Notas sobre tabagismo |
| `alcohol` | boolean | Consome álcool |
| `alcohol_notes` | text | Notas sobre álcool |
| `toothache` | boolean | Dor de dente |
| `toothache_notes` | text | Notas sobre dor |
| `gum_bleeding` | boolean | Sangramento gengival |
| `gum_bleeding_notes` | text | Notas sobre sangramento |
| `sensitivity` | boolean | Sensibilidade |
| `sensitivity_notes` | text | Notas sobre sensibilidade |
| `bad_breath` | boolean | Mau hálito |
| `bad_breath_notes` | text | Notas sobre hálito |
| `jaw_pain` | boolean | Dor na mandíbula |
| `jaw_pain_notes` | text | Notas sobre mandíbula |
| `previous_treatments` | boolean | Tratamentos anteriores |
| `previous_treatments_notes` | text | Notas sobre tratamentos |
| `orthodontics` | boolean | Ortodontia |
| `orthodontics_notes` | text | Notas sobre ortodontia |
| `surgeries` | boolean | Cirurgias |
| `surgeries_notes` | text | Notas sobre cirurgias |
| `anesthesia_reaction` | boolean | Reação à anestesia |
| `anesthesia_reaction_notes` | text | Notas sobre anestesia |

**Relacionamentos:**
- → `clientelA` (cliente_id)

---

### 13. **notas_cliente** (Anotações Privadas)
Notas e observações sobre pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da nota |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `cliente_id` | UUID | ID do paciente |
| `usuario_id` | UUID | ID do usuário que criou |
| `titulo` | string | Título da nota |
| `conteudo` | text | Conteúdo |
| `privada` | boolean | Se é privada |
| `categoria` | string | Categoria da nota |
| `tags` | string | Tags/palavras-chave |

**Relacionamentos:**
- → `clientelA` (cliente_id)
- → `usuarios` (usuario_id)

---

### 14. **timeline_eventos** (Linha do Tempo)
Eventos da timeline do paciente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do evento |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |
| `empresa_id` | UUID | ID da empresa |
| `tipo` | string | Tipo do evento |
| `titulo` | string | Título |
| `descricao` | text | Descrição |
| `data_evento` | timestamp | Data do evento |
| `usuario_id` | UUID | ID do usuário |
| `dados_relacionados` | json | Dados adicionais |
| `anexos` | string | Anexos |

**Relacionamentos:**
- → `empresa` (empresa.id)
- → `usuarios` (usuario_id)

---

### 15. **annotations** (Anotações)
Sistema alternativo de anotações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID único da anotação |
| `patient_id` | UUID | ID do paciente |
| `content` | text | Conteúdo |
| `category` | string | Categoria |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Relacionamentos:**
- → `clientelA` (patient_id)

---

## 📊 Diagrama de Relacionamentos

```
empresa
├── usuarios
├── clientelA (pacientes)
│   ├── consultas
│   │   └── retornos
│   ├── procedimentos (histórico)
│   ├── orcamentos
│   │   └── itens_orcamento
│   ├── plano_tratamento
│   │   └── itens_plano_tratamento
│   │       └── treatment_sessions
│   ├── anamnese
│   ├── notas_cliente
│   ├── timeline_eventos
│   └── annotations
└── procedimentos (catálogo, cliente_id = null)
```

---

## 🔐 Configuração de RLS (Row Level Security)

**Importante:** As políticas RLS devem permitir:
- Service role: acesso completo (usado pelo backend)
- Usuários autenticados: acesso filtrado por empresa_id
- Público: sem acesso

---

## 📝 Notas Importantes

1. **Multi-tenancy:** Quase todas as tabelas possuem `empresa_id` para isolamento de dados
2. **Soft Delete:** Use `ativo = false` ou `inativa = true` ao invés de deletar
3. **Timestamps:** Todas as tabelas possuem `created_at` e `updated_at`
4. **UUIDs:** Maioria das tabelas usa UUID como chave primária
5. **Procedimentos:** Tabela com uso duplo (catálogo + histórico)

---

## 🚀 Endpoints Disponíveis

### Dashboard
- `GET /dashboard/today-stats` - Estatísticas do dia
- `GET /dashboard/monthly-stats` - Estatísticas do mês

### Procedimentos
- `GET /procedures` - Listar procedimentos
- `GET /procedures/:id` - Buscar por ID
- `GET /procedures/categorias` - Listar categorias
- `POST /procedures` - Criar procedimento
- `PUT /procedures/:id` - Atualizar procedimento
- `DELETE /procedures/:id` - Desativar procedimento

### Teste de BD
- `GET /test-db/tables` - Listar todas as tabelas
- `GET /test-db/procedimentos` - Testar tabela procedimentos
- `GET /test-db/stats` - Estatísticas gerais

---

**Última Atualização:** 01/11/2025



