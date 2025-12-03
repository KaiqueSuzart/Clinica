# 🚀 Como Testar o PWA - Instruções Rápidas

## Opção 1: Modo Dev (Mais Fácil para Testar)

```bash
npm run dev
```

Depois acesse: **http://localhost:5173**

O PWA também funciona no modo dev!

## Opção 2: Preview (Build de Produção)

```bash
npm run build
npm run preview
```

A porta padrão é **4173**, mas verifique no terminal qual porta apareceu.

Acesse: **http://localhost:4173** (ou a porta que aparecer)

## Como Verificar a Porta

No terminal, você verá algo como:
```
➜  Local:   http://localhost:4173/
➜  Network: use --host to expose
```

Use a URL que aparecer no terminal!

## Testar Instalação do PWA

1. Acesse a URL no navegador
2. Abra DevTools (F12)
3. Vá em **Application** > **Service Workers**
4. Deve mostrar: "activated and is running"
5. Procure o ícone de instalação na barra de endereços (⬇️ ou 📱)
6. Clique e instale!

## Se a Porta Não Funcionar

Tente estas alternativas:
- `http://127.0.0.1:4173`
- `http://localhost:5173` (modo dev)
- Verifique o firewall/antivírus
- Verifique se outra aplicação está usando a porta


