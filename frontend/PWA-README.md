# PWA - Progressive Web App

O aplicativo foi configurado como PWA (Progressive Web App), permitindo que seja instalado em dispositivos móveis e desktop.

## Funcionalidades Implementadas

✅ **Service Worker**: Cache automático de recursos estáticos
✅ **Manifest**: Configuração completa do PWA
✅ **Offline Support**: Funcionalidade básica offline
✅ **Update Notifications**: Notificações quando há nova versão disponível
✅ **Install Prompt**: Suporte para instalação no dispositivo

## Como Testar

### 1. Build do Projeto
```bash
npm run build
```

### 2. Servir o Build
```bash
npm run preview
```

### 3. Testar no Navegador

#### Chrome/Edge:
1. Abra o DevTools (F12)
2. Vá para a aba "Application"
3. Verifique se o Service Worker está registrado
4. Verifique o Manifest em "Manifest"
5. Teste a instalação clicando no ícone de instalação na barra de endereços

#### Mobile:
1. Acesse o site no navegador móvel
2. No menu do navegador, selecione "Adicionar à tela inicial"
3. O app será instalado como um aplicativo nativo

## Configurações

### Manifest
O manifest está configurado em `vite.config.ts` com:
- Nome: "Sistema de Gestão para Clínica Odontológica"
- Nome curto: "Clínica Odonto"
- Tema: Azul (#2563eb)
- Modo: Standalone (abre como app nativo)
- Orientação: Portrait (vertical)

### Service Worker
- Cache automático de todos os recursos estáticos
- Cache de API com estratégia NetworkFirst (24 horas)
- Atualização automática quando há nova versão

### Ícones
Os ícones estão na pasta `public/`:
- `pwa-192x192.png` - Ícone padrão 192x192
- `pwa-512x512.png` - Ícone grande 512x512
- `apple-touch-icon.png` - Ícone para iOS
- `mask-icon.svg` - Ícone SVG para Safari

**Nota**: Atualmente os ícones são placeholders. Substitua por ícones reais seguindo as instruções em `public/README-ICONES.md`.

## Desenvolvimento

Durante o desenvolvimento (`npm run dev`), o PWA está habilitado em modo de desenvolvimento. Isso permite testar as funcionalidades PWA localmente.

## Produção

No build de produção, o service worker é gerado automaticamente e todos os recursos são pré-cacheados para funcionamento offline.

## Atualizações

Quando uma nova versão é publicada:
1. O service worker detecta automaticamente
2. Uma notificação aparece no canto inferior direito
3. O usuário pode escolher atualizar agora ou depois
4. Ao atualizar, a página recarrega automaticamente

## Troubleshooting

### Service Worker não registra
- Verifique se está servindo via HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique o console para erros

### Ícones não aparecem
- Verifique se os arquivos estão na pasta `public/`
- Verifique os caminhos no manifest
- Limpe o cache do service worker

### Atualizações não funcionam
- Verifique se o service worker está ativo
- Limpe o cache e recarregue a página
- Verifique os logs do console

