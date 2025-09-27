@echo off
echo ========================================
echo    INSTALADOR - PROJETO SHOW DE OFERTAS
echo ========================================
echo.
echo Este script vai instalar tudo que voce precisa!
echo.

REM Navegar para o diretorio do projeto (onde o arquivo está)
cd /d "%~dp0"

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js nao encontrado!
    echo.
    echo 📥 Baixe e instale o Node.js em:
    echo    https://nodejs.org/
    echo.
    echo ⚠️  IMPORTANTE: Reinicie o computador apos instalar o Node.js
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado!
)

echo.
echo 📦 Instalando dependencias...
echo (Isso pode demorar alguns minutos na primeira vez)
echo.

npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Falha ao instalar dependencias!
    echo.
    echo 💡 Solucoes possiveis:
    echo    1. Verifique sua conexao com internet
    echo    2. Execute como administrador
    echo    3. Tente: npm cache clean --force
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Instalacao concluida com sucesso!
echo.
echo 🚀 Agora voce pode usar o sistema:
echo    - Clique duplo em: start.bat
echo    - Ou execute: start.ps1
echo.
echo 📱 Acesse: http://localhost:3000
echo.
pause
