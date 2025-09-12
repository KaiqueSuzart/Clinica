@echo off
echo ========================================
echo SETUP COMPLETO - Backend Clinica
echo ========================================

echo.
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Instale e reinicie o terminal
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version

echo.
echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo npm encontrado:
npm --version

echo.
echo Verificando NestJS CLI...
nest --version >nul 2>&1
if %errorlevel% neq 0 (
    echo NestJS CLI nao encontrado. Instalando...
    npm install -g @nestjs/cli
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar NestJS CLI
        pause
        exit /b 1
    )
)

echo NestJS CLI encontrado:
nest --version

echo.
echo ========================================
echo Limpando instalacao anterior...
echo ========================================

if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo ========================================
echo Instalando dependencias...
echo ========================================

echo Usando package.json estavel...
copy package-stable.json package.json

npm install

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha na instalacao das dependencias
    echo.
    echo Solucoes possiveis:
    echo 1. Verifique sua conexao com a internet
    echo 2. Tente: npm cache clean --force
    echo 3. Verifique se o Node.js esta atualizado
    pause
    exit /b 1
)

echo.
echo ========================================
echo INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para executar o backend:
echo npm run start:dev
echo.
echo Ou execute diretamente:
echo npm run start:dev
echo.
pause
















