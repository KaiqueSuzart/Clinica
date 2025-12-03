# ✅ Botão de Instalação Movido para Configurações

O botão de instalação do PWA foi movido para a página de **Configurações** > **Aplicativo**.

## 🎯 O que foi feito:

1. ✅ Criado componente `InstallPromptCard.tsx` (versão para usar dentro de Card)
2. ✅ Adicionada nova aba "Aplicativo" nas Configurações
3. ✅ Removido `InstallPrompt` do `App.tsx` (não aparece mais como popup)
4. ✅ Adicionadas instruções sobre auto-start do computador

## 📍 Onde encontrar:

1. Acesse **Configurações** no menu lateral
2. Clique na aba **"Aplicativo"** (última aba)
3. Você verá:
   - Botão de instalação
   - Status do PWA (Service Worker, Manifest, etc.)
   - Instruções para abrir automaticamente ao iniciar o computador

## 🚀 Sobre Auto-Start:

O PWA em si não pode abrir automaticamente quando o computador inicia (por limitações de segurança dos navegadores). Mas você pode configurar manualmente:

### Windows:
1. Instale o aplicativo
2. Pressione `Win + R`
3. Digite: `shell:startup` e pressione Enter
4. Arraste o atalho do aplicativo para essa pasta

### Mac:
1. Instale o aplicativo
2. Abra "Preferências do Sistema" > "Usuários e Grupos"
3. Vá em "Itens de Login"
4. Adicione o aplicativo

### Linux:
1. Instale o aplicativo
2. Adicione um arquivo .desktop em `~/.config/autostart/`

## 📝 Nota:

As instruções completas estão na aba "Aplicativo" das Configurações!


