# PWA na Porta 5173 (Modo Desenvolvimento)

## ⚠️ Problema Conhecido

Na porta **5173** (modo desenvolvimento com `npm run dev`), alguns navegadores **não disparam automaticamente** o evento `beforeinstallprompt`, que é necessário para mostrar o prompt de instalação automático.

Isso é uma **limitação dos navegadores** para evitar instalações acidentais durante o desenvolvimento.

## ✅ Soluções

### Opção 1: Instalação Manual (Recomendado para Dev)

Mesmo sem o prompt automático, você **pode instalar manualmente**:

1. **No Chrome/Edge:**
   - Clique nos **três pontos (⋮)** no canto superior direito
   - Procure **"Instalar aplicativo"** ou **"Install app"**
   - OU procure o **ícone de instalação (⬇️)** na barra de endereços
   - Clique e siga as instruções

2. **No Firefox:**
   - Menu > **"Instalar Site como Aplicativo"**

### Opção 2: Usar Preview (Melhor Experiência)

Para uma experiência mais próxima da produção:

```bash
# 1. Fazer build
npm run build

# 2. Rodar preview (porta 4173)
npm run preview
```

Na porta **4173**, o navegador geralmente **dispara o prompt automaticamente**.

### Opção 3: Verificar no DevTools

1. Abra o **DevTools** (F12)
2. Vá em **Application** > **Manifest**
3. Verifique se o manifest está carregado corretamente
4. Procure o botão **"Add to homescreen"** ou **"Install"**

## 🔍 Verificações

### Service Worker está ativo?
- DevTools > **Application** > **Service Workers**
- Deve mostrar: "activated and is running"

### Manifest está carregado?
- DevTools > **Application** > **Manifest**
- Deve mostrar todas as informações do PWA

### PWA é instalável?
- O navegador verifica automaticamente se o PWA atende aos critérios:
  - ✅ Service Worker registrado
  - ✅ Manifest válido
  - ✅ HTTPS ou localhost
  - ✅ Ícones configurados

## 📝 Notas Importantes

- **Porta 5173 (dev)**: Prompt automático pode não aparecer, mas instalação manual funciona
- **Porta 4173 (preview)**: Prompt automático geralmente funciona
- **Produção (HTTPS)**: Prompt automático sempre funciona (se atender critérios)

## 🎯 Resumo

| Porta | Prompt Automático | Instalação Manual | Recomendado Para |
|-------|-------------------|-------------------|------------------|
| 5173 (dev) | ❌ Pode não aparecer | ✅ Funciona | Desenvolvimento |
| 4173 (preview) | ✅ Geralmente funciona | ✅ Funciona | Teste antes de produção |
| Produção | ✅ Funciona | ✅ Funciona | Uso real |

## 💡 Dica

Se você está testando a instalação do PWA, use:
```bash
npm run build && npm run preview
```

Isso dará a melhor experiência de instalação antes de fazer deploy em produção.

