# Sistema de Arquivos - Clínica Odontológica

## Funcionalidades Implementadas

### Backend
- ✅ Upload de arquivos para Supabase Storage
- ✅ Gerenciamento de metadados dos arquivos
- ✅ Categorização de arquivos (imagem, documento, raio-x, relatório)
- ✅ Validação de tipos e tamanhos de arquivo
- ✅ URLs públicas automáticas
- ✅ Estatísticas de uso por paciente
- ✅ API REST completa

### Frontend
- ✅ Interface para upload com drag & drop
- ✅ Seleção de pacientes
- ✅ Categorização de arquivos
- ✅ Visualização de imagens e documentos
- ✅ Download de arquivos
- ✅ Exclusão de arquivos
- ✅ Estatísticas por categoria
- ✅ Descrições opcionais

## Configuração Necessária

### 1. Executar Script SQL no Supabase
Execute o arquivo `supabase-storage-setup.sql` no painel SQL do Supabase para:
- Criar bucket `patient-files`
- Criar tabela `patient_files`
- Configurar políticas de segurança (RLS)
- Criar índices para performance

### 2. Dependências Instaladas
- `@nestjs/platform-express` - Upload de arquivos
- `multer` - Middleware para multipart/form-data
- `uuid` - Geração de nomes únicos
- `@types/multer` e `@types/uuid` - Tipos TypeScript

## Estrutura de Arquivos

### Backend
```
src/files/
├── dto/
│   ├── create-file.dto.ts    # Validação de upload
│   └── update-file.dto.ts    # Validação de atualização
├── files.controller.ts       # Endpoints da API
├── files.service.ts          # Lógica de negócio
└── files.module.ts          # Configuração do módulo
```

### Frontend
- `src/pages/Arquivos.tsx` - Interface principal
- `src/services/api.ts` - Métodos para comunicação com API

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/files/upload` | Upload de arquivo |
| GET | `/files/patient/:id` | Arquivos do paciente |
| GET | `/files/patient/:id/category/:category` | Arquivos por categoria |
| GET | `/files/patient/:id/stats` | Estatísticas do paciente |
| GET | `/files/:id` | Arquivo específico |
| PATCH | `/files/:id` | Atualizar arquivo |
| DELETE | `/files/:id` | Excluir arquivo |

## Categorias de Arquivo

| Categoria | Tipos Aceitos | Uso |
|-----------|---------------|-----|
| `image` | JPEG, PNG, GIF, WebP | Fotos do paciente |
| `document` | PDF, DOC, DOCX, TXT | Documentos gerais |
| `xray` | JPEG, PNG, GIF, WebP, PDF | Radiografias |
| `report` | PDF, DOC, DOCX, TXT | Relatórios médicos |

## Validações

- **Tamanho máximo:** 10MB por arquivo
- **Tipos permitidos:** Baseado na categoria selecionada
- **Nomes únicos:** UUID gerado automaticamente
- **Organização:** Pasta por paciente e categoria

## Segurança

- **RLS habilitado:** Controle de acesso por linha
- **Políticas configuradas:** Usuários autenticados apenas
- **Validação de tipos:** Verificação de MIME type
- **Service Role:** Backend usa chave de serviço para bypassing RLS

## Storage Structure

```
patient-files/
├── {patient_id}/
│   ├── image/
│   │   └── {uuid}.jpg
│   ├── document/
│   │   └── {uuid}.pdf
│   ├── xray/
│   │   └── {uuid}.jpg
│   └── report/
│       └── {uuid}.pdf
```

## Como Usar

### 1. Selecionar Paciente
- Escolha um paciente na lista dropdown

### 2. Fazer Upload
- Selecione a categoria do arquivo
- Adicione uma descrição (opcional)
- Arraste arquivos ou clique para selecionar
- Clique em "Fazer Upload"

### 3. Visualizar Arquivos
- Imagens são exibidas com preview
- Documentos mostram ícone e metadados
- Botões para visualizar, baixar e excluir

### 4. Estatísticas
- Total de arquivos por categoria
- Tamanho total utilizado
- Contadores específicos

## Próximos Passos

1. **Executar SQL no Supabase** - `supabase-storage-setup.sql`
2. **Testar upload** - Usar interface ou API examples
3. **Verificar permissões** - Confirmar que RLS está funcionando
4. **Backup automático** - Configurar se necessário

## Troubleshooting

### Erro de Upload
- Verificar se bucket `patient-files` existe
- Confirmar políticas de storage
- Checar tamanho e tipo do arquivo

### Erro de Permissão
- Verificar RLS na tabela `patient_files`
- Confirmar políticas de storage
- Checar autenticação

### Arquivo não carrega
- Verificar URL pública
- Confirmar bucket público
- Checar CORS se necessário
