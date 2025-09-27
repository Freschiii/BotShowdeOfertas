const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir arquivos estáticos
app.use(express.static('.'));

// Configurações
const PORT = process.env.PORT || 3000;
let isConnected = false;
let whatsappClient = null;

// Inicializar WhatsApp Client
function initializeWhatsApp() {
    console.log('🔄 Inicializando WhatsApp Web.js...');
    
    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ],
            timeout: 60000
        },
        restartOnAuthFail: true,
        qrMaxRetries: 3
    });

    // Evento quando QR Code é gerado
    whatsappClient.on('qr', (qr) => {
        console.log('📱 QR Code gerado!');
        console.log('📱 ==========================================');
        console.log('📱 QR CODE PARA CONECTAR WHATSAPP:');
        console.log('📱 ==========================================');
        
        // Mostrar QR Code no terminal
        qrcode.generate(qr, { small: true });
        
        console.log('📱 ==========================================');
        console.log('📱 Escaneie este QR Code com seu WhatsApp!');
        console.log('📱 ==========================================');
        
        // Enviar QR Code ASCII para o frontend
        io.emit('whatsapp-qr-ascii', qr);
        
        // Gerar QR Code visual para o site
        try {
            const QRCode = require('qrcode');
            QRCode.toDataURL(qr, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }).then(qrCodeDataURL => {
                console.log('📱 QR Code visual gerado para o site');
                io.emit('whatsapp-qr', qrCodeDataURL);
            }).catch(error => {
                console.error('❌ Erro ao gerar QR Code visual:', error);
            });
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code visual:', error);
        }
        
        io.emit('whatsapp-status', { status: 'offline' });
    });

    // Evento quando conectado
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp conectado com sucesso!');
        isConnected = true;
        io.emit('whatsapp-status', { status: 'online' });
        console.log('📱 Status online enviado para o frontend');
    });

    // Evento quando autenticado
    whatsappClient.on('authenticated', () => {
        console.log('✅ WhatsApp autenticado!');
        isConnected = true;
        io.emit('whatsapp-status', { status: 'online' });
    });

    // Evento quando autenticação falha
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ Falha na autenticação WhatsApp:', msg);
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
    });

    // Evento de mudança de estado
    whatsappClient.on('change_state', (state) => {
        console.log('🔄 Estado do WhatsApp mudou para:', state);
        if (state === 'CONNECTED') {
            isConnected = true;
            io.emit('whatsapp-status', { status: 'online' });
        } else if (state === 'UNPAIRED' || state === 'UNLAUNCHED') {
            isConnected = false;
            io.emit('whatsapp-status', { status: 'offline' });
        }
    });

    // Evento quando desconectado
    whatsappClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp desconectado:', reason);
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
    });

    // Evento de erro
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ Falha na autenticação WhatsApp:', msg);
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
    });

    // Tratamento de erros gerais
    whatsappClient.on('change_state', (state) => {
        console.log('🔄 Estado do WhatsApp mudou:', state);
    });

    // Tratamento de erros do Puppeteer
    whatsappClient.on('remote_session_saved', () => {
        console.log('✅ Sessão remota salva');
    });

    // Inicializar cliente
    whatsappClient.initialize();
}

// WebSocket listeners
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado via WebSocket');
    
    socket.on('connect-whatsapp', async () => {
        console.log('📱 Solicitação para conectar WhatsApp recebida');
        console.log('📱 Status atual isConnected:', isConnected);
        
        if (!whatsappClient) {
            console.log('🔄 Inicializando WhatsApp...');
            initializeWhatsApp();
        } else if (!isConnected) {
            console.log('🔄 Reconectando WhatsApp...');
            whatsappClient.initialize();
        } else {
            console.log('✅ WhatsApp já está conectado');
            socket.emit('whatsapp-status', { status: 'online' });
        }
        
        // Verificação adicional do status
        try {
            if (whatsappClient && whatsappClient.info) {
                const info = await whatsappClient.info;
                if (info && info.wid) {
                    console.log('✅ WhatsApp conectado (verificação manual)');
                    isConnected = true;
                    socket.emit('whatsapp-status', { status: 'online' });
                }
            }
        } catch (error) {
            console.log('❌ Erro ao verificar status:', error.message);
        }
    });

    socket.on('send-whatsapp', async (data) => {
        console.log('📤 Evento send-whatsapp recebido!');
        console.log('📤 Dados recebidos:', JSON.stringify(data, null, 2));
        console.log('📤 isConnected:', isConnected);
        console.log('📤 whatsappClient existe:', !!whatsappClient);
        
        if (!isConnected || !whatsappClient) {
            console.log('❌ WhatsApp não conectado');
            socket.emit('message-status', { success: false, error: 'WhatsApp não conectado' });
            return;
        }

        try {
            const { chatId, number, message, image } = data;
            const targetNumber = number || chatId;
            console.log('📤 Número/ChatId:', targetNumber);
            console.log('📤 Mensagem:', message);
            console.log('📤 Imagem:', image);
            
            if (image) {
                console.log('📤 Enviando mensagem com imagem...');
                // Enviar mensagem com imagem
                const media = MessageMedia.fromFilePath(image);
                await whatsappClient.sendMessage(targetNumber, media, { caption: message });
            } else {
                console.log('📤 Enviando mensagem apenas texto...');
                // Enviar apenas texto
                await whatsappClient.sendMessage(targetNumber, message);
            }
            
            console.log('✅ Mensagem enviada com sucesso');
            socket.emit('message-status', { success: true });
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            socket.emit('message-status', { success: false, error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
    });
});

// Inicializar WhatsApp automaticamente
initializeWhatsApp();

// Verificar status do WhatsApp periodicamente
setInterval(async () => {
    if (whatsappClient && !isConnected) {
        try {
            const info = await whatsappClient.info;
            if (info && info.wid) {
                console.log('✅ WhatsApp conectado (verificação periódica)');
                isConnected = true;
                io.emit('whatsapp-status', { status: 'online' });
            }
        } catch (error) {
            // Cliente não conectado
        }
    }
}, 5000); // Verificar a cada 5 segundos

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log('📱 WhatsApp Web.js inicializado!');
});