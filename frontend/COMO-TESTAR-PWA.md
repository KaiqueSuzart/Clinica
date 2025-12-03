# Como Testar o PWA

## 1. Iniciar o Preview

Execute no terminal:
```bash
npm run preview
```

A porta padrão é **4173**, mas pode variar. Verifique no terminal qual porta apareceu.

**URLs para testar:**
- `http://localhost:4173` (porta padrão)
- `http://127.0.0.1:4173` (alternativa)
- Se aparecer outra porta no terminal, use essa

## 2. Testar no Navegador (Chrome/Edge)

### Verificar Service Worker:
1. Abra o DevTools (F12)
2. Vá para a aba **"Application"** (Aplicação)
3. No menu lateral, clique em **"Service Workers"**
   - Deve mostrar: "activated and is running"
   - Status: "activated"

### Verificar Manifest:
1. No DevTools, aba **"Application"**
2. Clique em **"Manifest"** no menu lateral
   - Deve mostrar todas as informações do PWA
   - Ícones, nome, tema, etc.

### Instalar o PWA:
1. Procure o ícone de **instalação** na barra de endereços (ao lado da URL)
   - Ícone: ⬇️ ou 📱
2. Clique no ícone
3. Clique em **"Instalar"**
4. O app será instalado e abrirá como aplicativo nativo

## 3. Testar no Mobile

### Android (Chrome):
1. Acesse a URL no navegador do celular
2. No menu do navegador (3 pontos), selecione:
   - **"Adicionar à tela inicial"** ou **"Instalar app"**
3. Confirme a instalação
4. O app aparecerá na tela inicial como um app nativo

### iOS (Safari):
1. Acesse a URL no Safari
2. Toque no botão de compartilhar (quadrado com seta)
3. Role para baixo e toque em:
   - **"Adicionar à Tela de Início"**
4. Confirme
5. O app aparecerá na tela inicial

## 4. Testar Atualização Automática

### Simular uma atualização:
1. Faça uma pequena alteração no código (ex: mudar uma cor)
2. Execute `npm run build` novamente
3. Recarregue a página no app instalado
4. Você verá a notificação "Atualizando..." e a página recarregará automaticamente

### Verificar no DevTools:
1. Abra DevTools (F12)
2. Vá em **"Application"** > **"Service Workers"**
3. Clique em **"Update"** para forçar verificação de atualização
4. Se houver nova versão, será baixada e aplicada automaticamente

## 5. Testar Funcionalidade Offline

1. Com o app instalado, abra o DevTools
2. Vá em **"Network"** (Rede)
3. Marque **"Offline"**
4. Recarregue a página
5. A interface deve carregar (mas dados da API não funcionarão sem internet)

## URLs de Teste

- **Preview Local**: `http://localhost:4173`
- **Produção**: (após deploy, use a URL do seu servidor)

## Checklist de Teste

- [ ] Service Worker registrado
- [ ] Manifest carregado corretamente
- [ ] Ícones aparecem corretamente
- [ ] App pode ser instalado
- [ ] App abre como aplicativo nativo (sem barra do navegador)
- [ ] Atualização automática funciona
- [ ] Notificação de atualização aparece
- [ ] Funciona offline (interface básica)

## Problemas Comuns

### Service Worker não registra:
- Verifique se está servindo via HTTPS ou localhost
- Limpe o cache do navegador
- Verifique o console para erros

### Ícones não aparecem:
- Verifique se os arquivos estão em `public/`
- Limpe o cache do service worker
- Verifique os caminhos no manifest

### Atualização não funciona:
- Verifique se o service worker está ativo
- Limpe o cache e recarregue
- Verifique os logs do console
