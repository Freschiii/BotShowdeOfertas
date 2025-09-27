# ========================================
#    PROJETO SHOW DE OFERTAS
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PROJETO SHOW DE OFERTAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do projeto (onde o arquivo está)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js primeiro." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório correto." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERRO: Falha ao instalar dependências!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SERVIDOR INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏹️  Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar o servidor
node server.js
