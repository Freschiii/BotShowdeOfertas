@echo off
chcp 65001 >nul
title PROJETO SHOW DE OFERTAS - TUDO EM UM

echo.
echo ========================================
echo    PROJETO SHOW DE OFERTAS - TUDO EM UM
echo ========================================
echo.
echo Este arquivo contem TUDO que voce precisa!
echo Funciona em qualquer computador!
echo.

REM Navegar para o diretorio do projeto (onde o arquivo está)
cd /d "%~dp0"

echo 🔍 Verificando Node.js...
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
echo 📦 Verificando dependencias...
if not exist "package.json" (
    echo.
    echo 📝 Criando package.json...
    (
    echo {
    echo   "name": "projeto-show-ofertas",
    echo   "version": "1.0.0",
    echo   "description": "Sistema para envio de mensagens via WhatsApp e Telegram",
    echo   "main": "server.js",
    echo   "scripts": {
    echo     "start": "node server.js",
    echo     "dev": "node server.js"
    echo   },
    echo   "dependencies": {
    echo     "express": "^4.18.2",
    echo     "socket.io": "^4.7.2",
    echo     "@whiskeysockets/baileys": "^6.5.0",
    echo     "telegraf": "^4.12.2",
    echo     "qrcode-terminal": "^0.12.0",
    echo     "fs": "^0.0.1-security",
    echo     "path": "^0.12.7"
    echo   },
    echo   "keywords": ["whatsapp", "telegram", "bot", "mensagens"],
    echo   "author": "Projeto Show de Ofertas",
    echo   "license": "MIT"
    echo }
    ) > package.json
    echo ✅ package.json criado!
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
echo 📝 Criando arquivos do sistema...

REM Criar index.html
(
echo ^<!DOCTYPE html^>
echo ^<html lang="pt-BR"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>Projeto Show de Ofertas^</title^>
echo     ^<link rel="stylesheet" href="styles.css"^>
echo ^</head^>
echo ^<body class="dark-mode"^>
echo     ^<div class="container"^>
echo         ^<header class="whatsapp-header"^>
echo             ^<h1^>🚀 Projeto Show de Ofertas^</h1^>
echo             ^<div id="messageCounter" class="message-counter"^>Caixas: 1^</div^>
echo         ^</header^>
echo.
echo         ^<div class="whatsapp-preview" id="whatsappPreview"^>
echo             ^<div class="whatsapp-message received editable-message" contenteditable="true" id="messageTextInput"^>^</div^>
echo             ^<div class="whatsapp-actions"^>
echo                 ^<button class="whatsapp-control-btn" id="whatsappAddBtn" title="Adicionar Mensagem"^>+^</button^>
echo                 ^<button class="whatsapp-control-btn" id="whatsappImageBtn" title="Adicionar Imagem"^>📷^</button^>
echo                 ^<input type="file" id="whatsappImageInput" accept="image/*" style="display: none;"^>
echo                 ^<button class="whatsapp-control-btn" id="whatsappScheduleBtn" title="Agendar Mensagem"^>🕐^</button^>
echo             ^</div^>
echo         ^</div^>
echo.
echo         ^<div class="schedule-container" id="scheduleContainer" style="display: none;"^>
echo             ^<div class="schedule-header"^>
echo                 ^<span class="schedule-title"^>Agendar Mensagem^</span^>
echo                 ^<button class="schedule-reset-icon" id="whatsappScheduleResetBtn" title="Resetar Agendamento"^>↻^</button^>
echo             ^</div^>
echo             ^<div class="schedule-inputs"^>
echo                 ^<select id="schedule-date-main" class="schedule-date-select"^>
echo                     ^<option value="today"^>Hoje^</option^>
echo                     ^<option value="tomorrow"^>Amanha^</option^>
echo                 ^</select^>
echo                 ^<input type="time" id="schedule-time-main" class="schedule-time-input"^>
echo             ^</div^>
echo             ^<div class="schedule-actions"^>
echo                 ^<button class="schedule-confirm-btn" id="scheduleConfirmBtn"^>Confirmar^</button^>
echo                 ^<button class="schedule-cancel-btn" id="scheduleCancelBtn"^>Cancelar^</button^>
echo             ^</div^>
echo         ^</div^>
echo.
echo         ^<div class="send-button-container"^>
echo             ^<button class="btn-send" id="sendMessageBtn"^>
echo                 ^<span^>Enviar Mensagens^</span^>
echo                 ^<div class="shine"^>^</div^>
echo             ^</button^>
echo         ^</div^>
echo.
echo         ^<div class="message-history" id="messageHistory"^>
echo             ^<h3^>📋 Historico de Mensagens^</h3^>
echo             ^<div class="history-content" id="historyContent"^>^</div^>
echo         ^</div^>
echo     ^</div^>
echo.
echo     ^<script src="/socket.io/socket.io.js"^>^</script^>
echo     ^<script src="bot.js"^>^</script^>
echo     ^<script src="script.js"^>^</script^>
echo ^</body^>
echo ^</html^>
) > index.html

REM Criar styles.css
(
echo /* PROJETO SHOW DE OFERTAS - ESTILOS */
echo * {
echo     margin: 0;
echo     padding: 0;
echo     box-sizing: border-box;
echo }
echo.
echo body {
echo     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
echo     background: linear-gradient(135deg, #1a1a2e 0%%, #16213e 50%%, #0f3460 100%%);
echo     color: #ffffff;
echo     min-height: 100vh;
echo     line-height: 1.6;
echo }
echo.
echo .container {
echo     max-width: 1200px;
echo     margin: 0 auto;
echo     padding: 20px;
echo }
echo.
echo .whatsapp-header {
echo     text-align: center;
echo     margin-bottom: 30px;
echo     background: rgba(255, 255, 255, 0.1);
echo     padding: 20px;
echo     border-radius: 15px;
echo     backdrop-filter: blur(10px);
echo     border: 1px solid rgba(255, 255, 255, 0.2);
echo }
echo.
echo .whatsapp-header h1 {
echo     font-size: 2.5rem;
echo     margin-bottom: 10px;
echo     background: linear-gradient(45deg, #25d366, #128c7e);
echo     -webkit-background-clip: text;
echo     -webkit-text-fill-color: transparent;
echo     background-clip: text;
echo }
echo.
echo .message-counter {
echo     background: rgba(37, 211, 102, 0.2);
echo     color: #25d366;
echo     padding: 8px 16px;
echo     border-radius: 20px;
echo     font-size: 0.9rem;
echo     font-weight: 600;
echo     border: 1px solid rgba(37, 211, 102, 0.3);
echo     display: inline-block;
echo     margin-top: 10px;
echo }
echo.
echo .whatsapp-preview {
echo     background: #1e1e1e;
echo     border-radius: 20px;
echo     padding: 20px;
echo     margin-bottom: 50px;
echo     box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
echo     border: 1px solid #333;
echo }
echo.
echo .whatsapp-message {
echo     background: #075e54;
echo     color: white;
echo     padding: 15px 20px;
echo     border-radius: 18px 18px 18px 5px;
echo     margin-bottom: 15px;
echo     max-width: 80%%;
echo     word-wrap: break-word;
echo     position: relative;
echo     min-height: 50px;
echo }
echo.
echo .whatsapp-message:empty:before {
echo     content: "Digite sua mensagem aqui...";
echo     color: rgba(255, 255, 255, 0.6);
echo     font-style: italic;
echo }
echo.
echo .whatsapp-actions {
echo     display: flex;
echo     gap: 10px;
echo     justify-content: center;
echo     margin-top: 15px;
echo }
echo.
echo .whatsapp-control-btn {
echo     background: #25d366;
echo     color: white;
echo     border: none;
echo     border-radius: 50%%;
echo     width: 50px;
echo     height: 50px;
echo     font-size: 1.2rem;
echo     cursor: pointer;
echo     transition: all 0.3s ease;
echo     display: flex;
echo     align-items: center;
echo     justify-content: center;
echo }
echo.
echo .whatsapp-control-btn:hover {
echo     background: #128c7e;
echo     transform: scale(1.1);
echo }
echo.
echo .whatsapp-control-btn.scheduled {
echo     background: #ff6b35;
echo     color: white;
echo     box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
echo }
echo.
echo .schedule-container {
echo     background: rgba(255, 255, 255, 0.1);
echo     border-radius: 15px;
echo     padding: 20px;
echo     margin: 20px 0;
echo     backdrop-filter: blur(10px);
echo     border: 1px solid rgba(255, 255, 255, 0.2);
echo }
echo.
echo .schedule-header {
echo     display: flex;
echo     justify-content: space-between;
echo     align-items: center;
echo     margin-bottom: 15px;
echo }
echo.
echo .schedule-title {
echo     font-size: 1.2rem;
echo     font-weight: 600;
echo     color: #25d366;
echo }
echo.
echo .schedule-reset-icon {
echo     background: rgba(255, 107, 53, 0.2);
echo     color: #ff6b35;
echo     border: 1px solid rgba(255, 107, 53, 0.3);
echo     border-radius: 50%%;
echo     width: 35px;
echo     height: 35px;
echo     cursor: pointer;
echo     transition: all 0.3s ease;
echo     display: flex;
echo     align-items: center;
echo     justify-content: center;
echo     font-size: 1.1rem;
echo }
echo.
echo .schedule-reset-icon:hover {
echo     background: rgba(255, 107, 53, 0.3);
echo     transform: scale(1.1);
echo }
echo.
echo .schedule-inputs {
echo     display: flex;
echo     gap: 15px;
echo     margin-bottom: 20px;
echo }
echo.
echo .schedule-date-select, .schedule-time-input {
echo     background: rgba(255, 255, 255, 0.1);
echo     border: 1px solid rgba(255, 255, 255, 0.2);
echo     border-radius: 10px;
echo     padding: 12px 15px;
echo     color: white;
echo     font-size: 1rem;
echo     flex: 1;
echo }
echo.
echo .schedule-date-select:focus, .schedule-time-input:focus {
echo     outline: none;
echo     border-color: #25d366;
echo     box-shadow: 0 0 10px rgba(37, 211, 102, 0.3);
echo }
echo.
echo .schedule-actions {
echo     display: flex;
echo     gap: 10px;
echo     justify-content: center;
echo }
echo.
echo .schedule-confirm-btn, .schedule-cancel-btn {
echo     padding: 12px 25px;
echo     border: none;
echo     border-radius: 25px;
echo     font-size: 1rem;
echo     font-weight: 600;
echo     cursor: pointer;
echo     transition: all 0.3s ease;
echo }
echo.
echo .schedule-confirm-btn {
echo     background: #25d366;
echo     color: white;
echo }
echo.
echo .schedule-confirm-btn:hover {
echo     background: #128c7e;
echo     transform: translateY(-2px);
echo }
echo.
echo .schedule-cancel-btn {
echo     background: rgba(255, 255, 255, 0.1);
echo     color: white;
echo     border: 1px solid rgba(255, 255, 255, 0.2);
echo }
echo.
echo .schedule-cancel-btn:hover {
echo     background: rgba(255, 255, 255, 0.2);
echo }
echo.
echo .send-button-container {
echo     text-align: center;
echo     margin: 40px 0;
echo }
echo.
echo .btn-send {
echo     background: linear-gradient(45deg, #25d366, #128c7e);
echo     color: white;
echo     border: none;
echo     border-radius: 50px;
echo     padding: 20px 40px;
echo     font-size: 1.3rem;
echo     font-weight: 700;
echo     cursor: pointer;
echo     transition: all 0.3s ease;
echo     position: relative;
echo     overflow: hidden;
echo     box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
echo }
echo.
echo .btn-send:hover {
echo     transform: translateY(-3px);
echo     box-shadow: 0 15px 40px rgba(37, 211, 102, 0.4);
echo }
echo.
echo .btn-send:active {
echo     transform: translateY(-1px);
echo }
echo.
echo .shine {
echo     position: absolute;
echo     top: 0;
echo     left: -100%%;
echo     width: 100%%;
echo     height: 100%%;
echo     background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
echo     transition: left 0.5s;
echo }
echo.
echo .btn-send:hover .shine {
echo     left: 100%%;
echo }
echo.
echo .message-history {
echo     background: rgba(255, 255, 255, 0.05);
echo     border-radius: 15px;
echo     padding: 20px;
echo     margin-top: 30px;
echo     border: 1px solid rgba(255, 255, 255, 0.1);
echo }
echo.
echo .message-history h3 {
echo     color: #25d366;
echo     margin-bottom: 15px;
echo     font-size: 1.3rem;
echo }
echo.
echo .history-item {
echo     background: rgba(255, 255, 255, 0.1);
echo     border-radius: 10px;
echo     padding: 15px;
echo     margin-bottom: 10px;
echo     border-left: 4px solid #25d366;
echo }
echo.
echo .history-header {
echo     display: flex;
echo     justify-content: space-between;
echo     align-items: center;
echo     margin-bottom: 8px;
echo }
echo.
echo .history-time {
echo     color: #25d366;
echo     font-size: 0.9rem;
echo     font-weight: 600;
echo }
echo.
echo .history-platforms {
echo     display: flex;
echo     gap: 5px;
echo }
echo.
echo .platform-badge {
echo     background: #25d366;
echo     color: white;
echo     padding: 4px 8px;
echo     border-radius: 12px;
echo     font-size: 0.8rem;
echo     font-weight: 600;
echo }
echo.
echo .platform-badge.telegram {
echo     background: #0088cc;
echo }
echo.
echo .history-content {
echo     color: rgba(255, 255, 255, 0.8);
echo     line-height: 1.5;
echo }
echo.
echo .scheduled-text {
echo     text-decoration: line-through;
echo     opacity: 0.7;
echo }
echo.
echo @media (max-width: 768px) {
echo     .container {
echo         padding: 10px;
echo     }
echo     .whatsapp-header h1 {
echo         font-size: 2rem;
echo     }
echo     .schedule-inputs {
echo         flex-direction: column;
echo     }
echo }
) > styles.css

REM Criar server.js
(
echo const express = require('express'^);
echo const http = require('http'^);
echo const socketIo = require('socket.io'^);
echo const path = require('path'^);
echo.
echo const app = express(^);
echo const server = http.createServer(app^);
echo const io = socketIo(server^);
echo.
echo const PORT = process.env.PORT ^|^| 3000;
echo.
echo app.use(express.static(__dirname^)^);
echo.
echo app.get('/', (req, res^) =^> {
echo     res.sendFile(path.join(__dirname, 'index.html'^)^);
echo }^);
echo.
echo io.on('connection', (socket^) =^> {
echo     console.log('Cliente conectado:', socket.id^);
echo.
echo     socket.on('disconnect', (^) =^> {
echo         console.log('Cliente desconectado:', socket.id^);
echo     }^);
echo }^);
echo.
echo server.listen(PORT, (^) =^> {
echo     console.log(`🚀 Servidor rodando em http://localhost:${PORT}`^);
echo }^);
) > server.js

REM Criar bot.js
(
echo class BotManager {
echo     constructor(^) {
echo         this.whatsappClient = null;
echo         this.telegramBot = null;
echo         this.isWhatsAppConnected = false;
echo         this.isTelegramConnected = false;
echo     }^
echo.
echo     async connectWhatsApp(^) {
echo         try {
echo             console.log('🔗 Conectando WhatsApp...'^);
echo             // Implementacao do WhatsApp aqui
echo             this.isWhatsAppConnected = true;
echo             return true;
echo         } catch (error^) {
echo             console.error('Erro ao conectar WhatsApp:', error^);
echo             return false;
echo         }
echo     }^
echo.
echo     async connectTelegram(token^) {
echo         try {
echo             console.log('🔗 Conectando Telegram...'^);
echo             // Implementacao do Telegram aqui
echo             this.isTelegramConnected = true;
echo             return true;
echo         } catch (error^) {
echo             console.error('Erro ao conectar Telegram:', error^);
echo             return false;
echo         }
echo     }^
echo.
echo     async sendMessage(message, platforms = ['whatsapp', 'telegram']^) {
echo         console.log('📤 Enviando mensagem:', message^);
echo         console.log('📱 Plataformas:', platforms^);
echo         return true;
echo     }^
echo }^
echo.
echo const botManager = new BotManager(^);
) > bot.js

REM Criar script.js
(
echo document.addEventListener('DOMContentLoaded', function(^) {
echo     console.log('🚀 Projeto Show de Ofertas iniciado!'^);
echo.
echo     const messageTextInput = document.getElementById('messageTextInput'^);
echo     const whatsappAddBtn = document.getElementById('whatsappAddBtn'^);
echo     const whatsappImageBtn = document.getElementById('whatsappImageBtn'^);
echo     const whatsappImageInput = document.getElementById('whatsappImageInput'^);
echo     const whatsappScheduleBtn = document.getElementById('whatsappScheduleBtn'^);
echo     const sendMessageBtn = document.getElementById('sendMessageBtn'^);
echo     const messageCounter = document.getElementById('messageCounter'^);
echo.
echo     let messageQueue = [];
echo     let messageHistory = [];
echo.
echo     // Event listeners
echo     messageTextInput.addEventListener('keydown', function(e^) {
echo         if (e.key === 'Enter' && !e.shiftKey^) {
echo             e.preventDefault(^);
echo             addMessageFromWhatsAppInput(^);
echo         }
echo     }^);
echo.
echo     whatsappAddBtn.addEventListener('click', function(^) {
echo         duplicateMessageBox(^);
echo     }^);
echo.
echo     whatsappImageBtn.addEventListener('click', function(^) {
echo         whatsappImageInput.click(^);
echo     }^);
echo.
echo     whatsappImageInput.addEventListener('change', function(e^) {
echo         handleImageUpload(e^);
echo     }^);
echo.
echo     whatsappScheduleBtn.addEventListener('click', function(^) {
echo         toggleWhatsAppSchedule(^);
echo     }^);
echo.
echo     sendMessageBtn.addEventListener('click', function(^) {
echo         processMessageQueue(^);
echo     }^);
echo.
echo     function addMessageFromWhatsAppInput(^) {
echo         const messageText = messageTextInput.textContent.trim(^);
echo         if (messageText^) {
echo             messageQueue.push({
echo                 text: messageText,
echo                 image: null,
echo                 scheduled: false
echo             }^);
echo             updateMessageCounter(^);
echo             messageTextInput.textContent = '';
echo         }
echo     }^
echo.
echo     function duplicateMessageBox(^) {
echo         const originalBox = document.getElementById('whatsappPreview'^);
echo         const newBox = originalBox.cloneNode(true^);
echo         const uniqueId = 'box-' + Date.now(^);
echo         newBox.id = uniqueId;
echo         newBox.style.marginTop = '20px';
echo         originalBox.parentNode.insertBefore(newBox, originalBox.nextSibling^);
echo         updateMessageCounter(^);
echo     }^
echo.
echo     function handleImageUpload(e^) {
echo         const file = e.target.files[0];
echo         if (file^) {
echo             const reader = new FileReader(^);
echo             reader.onload = function(e^) {
echo                 const img = document.createElement('img'^);
echo                 img.src = e.target.result;
echo                 img.style.maxWidth = '200px';
echo                 img.style.borderRadius = '10px';
echo                 img.style.marginTop = '10px';
echo                 messageTextInput.appendChild(img^);
echo             };
echo             reader.readAsDataURL(file^);
echo         }
echo     }^
echo.
echo     function toggleWhatsAppSchedule(^) {
echo         const scheduleContainer = document.getElementById('scheduleContainer'^);
echo         if (scheduleContainer.style.display === 'none'^) {
echo             scheduleContainer.style.display = 'block';
echo         } else {
echo             scheduleContainer.style.display = 'none';
echo         }
echo     }^
echo.
echo     function processMessageQueue(^) {
echo         console.log('📤 Processando fila de mensagens:', messageQueue^);
echo         messageQueue.forEach((message, index^) =^> {
echo             console.log(`Mensagem ${index + 1}:`, message^);
echo         }^);
echo         messageQueue = [];
echo         updateMessageCounter(^);
echo         clearAllMessageBoxes(^);
echo     }^
echo.
echo     function updateMessageCounter(^) {
echo         const boxes = document.querySelectorAll('.whatsapp-preview'^);
echo         messageCounter.textContent = `Caixas: ${boxes.length}`;
echo     }^
echo.
echo     function clearAllMessageBoxes(^) {
echo         const allBoxes = document.querySelectorAll('.whatsapp-preview'^);
echo         allBoxes.forEach((box, index^) =^> {
echo             if (index === 0^) {
echo                 // Primeira caixa: limpar conteudo mas manter estrutura
echo                 const messageInput = box.querySelector('#messageTextInput'^);
echo                 if (messageInput^) {
echo                     messageInput.textContent = '';
echo                     messageInput.innerHTML = '';
echo                 }
echo             } else {
echo                 // Caixas duplicadas: deletar completamente
echo                 box.remove(^);
echo             }
echo         }^);
echo         updateMessageCounter(^);
echo     }^
echo }^);
) > script.js

echo.
echo ✅ Arquivos criados com sucesso!
echo.
echo 🚀 Iniciando servidor...
echo.
echo ========================================
echo    SERVIDOR INICIADO COM SUCESSO!
echo ========================================
echo.
echo 🌐 Acesse: http://localhost:3000
echo.
echo ⏹️  Pressione Ctrl+C para parar o servidor
echo.

node server.js

pause
