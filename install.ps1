# ========================================
#    INSTALADOR - PROJETO SHOW DE OFERTAS
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR - PROJETO SHOW DE OFERTAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script vai instalar tudo que você precisa!" -ForegroundColor Yellow
Write-Host ""

# Navegar para o diretório do projeto (onde o arquivo está)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Baixe e instale o Node.js em:" -ForegroundColor Yellow
    Write-Host "   https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Reinicie o computador após instalar o Node.js" -ForegroundColor Red
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
Write-Host "(Isso pode demorar alguns minutos na primeira vez)" -ForegroundColor Gray
Write-Host ""

try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install falhou"
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERRO: Falha ao instalar dependências!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Soluções possíveis:" -ForegroundColor Yellow
    Write-Host "   1. Verifique sua conexão com internet" -ForegroundColor White
    Write-Host "   2. Execute como administrador" -ForegroundColor White
    Write-Host "   3. Tente: npm cache clean --force" -ForegroundColor White
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "✅ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora você pode usar o sistema:" -ForegroundColor Cyan
Write-Host "   - Clique duplo em: start.bat" -ForegroundColor White
Write-Host "   - Ou execute: start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📱 Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Read-Host "Pressione Enter para sair"
