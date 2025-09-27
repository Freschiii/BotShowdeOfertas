@echo off
echo ========================================
echo    PROJETO SHOW DE OFERTAS
echo ========================================
echo.
echo Iniciando servidor...
echo.

REM Navegar para o diretorio do projeto (onde o arquivo está)
cd /d "%~dp0"

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se o package.json existe
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Certifique-se de estar no diretorio correto.
    pause
    exit /b 1
)

REM Instalar dependencias se necessario
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Iniciar o servidor
echo.
echo ========================================
echo    SERVIDOR INICIADO COM SUCESSO!
echo ========================================
echo.
echo Acesse: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

node server.js

pause
