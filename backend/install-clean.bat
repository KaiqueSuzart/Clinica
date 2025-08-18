@echo off
echo ========================================
echo Limpando cache e instalando dependencias...
echo ========================================

echo.
echo Limpando cache do npm...
npm cache clean --force

echo.
echo Removendo node_modules e package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Instalando dependencias...
npm install

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo Para executar o backend:
echo npm run start:dev
echo.
pause

