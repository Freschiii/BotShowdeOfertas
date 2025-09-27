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
                '--disable-gpu'
            ]
        }
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
    });

    // Evento quando autenticado
    whatsappClient.on('authenticated', () => {
        console.log('✅ WhatsApp autenticado!');
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

    // Inicializar cliente
    whatsappClient.initialize();
}

// WebSocket listeners
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado via WebSocket');
    
    socket.on('connect-whatsapp', async () => {
        console.log('📱 Solicitação para conectar WhatsApp recebida');
        
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
    });

    socket.on('send-message', async (data) => {
        console.log('📤 Enviando mensagem:', data);
        
        if (!isConnected || !whatsappClient) {
            console.log('❌ WhatsApp não conectado');
            socket.emit('message-status', { success: false, error: 'WhatsApp não conectado' });
            return;
        }

        try {
            const { number, message, image } = data;
            
            if (image) {
                // Enviar mensagem com imagem
                const media = MessageMedia.fromFilePath(image);
                await whatsappClient.sendMessage(number, media, { caption: message });
            } else {
                // Enviar apenas texto
                await whatsappClient.sendMessage(number, message);
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

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log('📱 WhatsApp Web.js inicializado!');
});