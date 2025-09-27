const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
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

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Estado do WhatsApp
let whatsappSocket = null;
let isConnected = false;

// Função para conectar WhatsApp
async function connectWhatsApp() {
    try {
        // FORÇAR DESCONEXÃO COMPLETA
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
        
        // Limpar socket anterior
        if (whatsappSocket) {
            try {
                await whatsappSocket.logout();
            } catch (e) {}
            whatsappSocket = null;
        }
        
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
        
        whatsappSocket = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: {
                level: 'silent',
                child: () => ({
                    level: 'silent',
                    trace: () => {},
                    debug: () => {},
                    info: () => {},
                    warn: () => {},
                    error: () => {},
                    fatal: () => {}
                }),
                trace: () => {},
                debug: () => {},
                info: () => {},
                warn: () => {},
                error: () => {},
                fatal: () => {}
            }
        });

        whatsappSocket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            console.log('🔄 Status do WhatsApp:', connection);
            
            // SEMPRE começar como offline
            if (!isConnected) {
                io.emit('whatsapp-status', { status: 'offline' });
            }
            
            if (qr) {
                console.log('📱 QR Code gerado!');
                console.log('📱 QR Code no terminal:');
                qrcode.generate(qr, { small: true });
                console.log('📱 QR Code ASCII enviado para o cliente...');
                
                // Enviar QR Code ASCII para o cliente
                io.emit('whatsapp-qr-ascii', qr);
                
                // Também gerar QR Code visual
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
                        console.log('📱 QR Code visual gerado, enviando...');
                        io.emit('whatsapp-qr', qrCodeDataURL);
                    }).catch(error => {
                        console.error('❌ Erro ao gerar QR Code visual:', error);
                    });
                } catch (error) {
                    console.error('❌ Erro ao gerar QR Code visual:', error);
                }
                
                // Resetar status quando QR Code é gerado
                isConnected = false;
                io.emit('whatsapp-status', { status: 'offline' });
            }
            
            if (connection === 'close') {
                isConnected = false;
                io.emit('whatsapp-status', { status: 'offline' });
                console.log('WhatsApp desconectado');
                // NÃO RECONECTAR AUTOMATICAMENTE
            } else if (connection === 'open') {
                // Só marcar como conectado quando realmente conectar
                isConnected = true;
                io.emit('whatsapp-status', { status: 'online' });
                console.log('WhatsApp conectado!');
            } else if (connection === 'connecting') {
                // Mostrar status de conectando
                io.emit('whatsapp-status', { status: 'connecting' });
            }
        });

        whatsappSocket.ev.on('creds.update', saveCreds);

    } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
        io.emit('whatsapp-error', { message: error.message });
    }
}

// Função para enviar mensagem WhatsApp
async function sendWhatsAppMessage(chatId, message, imagePath = null) {
    try {
        if (!isConnected || !whatsappSocket) {
            throw new Error('WhatsApp não está conectado');
        }

        if (imagePath) {
            // Enviar com imagem
            await whatsappSocket.sendMessage(chatId, {
                image: { url: imagePath },
                caption: message
            });
        } else {
            // Enviar apenas texto
            await whatsappSocket.sendMessage(chatId, { text: message });
        }

        return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// WebSocket para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado via WebSocket');
    
    // Conectar WhatsApp
    socket.on('connect-whatsapp', async () => {
        console.log('📱 Solicitação para conectar WhatsApp recebida');
        
        // Limpar sessão anterior
        if (whatsappSocket) {
            try {
                console.log('🔄 Fazendo logout da sessão anterior...');
                await whatsappSocket.logout();
            } catch (e) {
                console.log('⚠️ Erro ao fazer logout:', e.message);
            }
        }
        
        // Limpar arquivos de autenticação
        const fs = require('fs');
        const path = require('path');
        try {
            const authDir = './auth_info_baileys';
            if (fs.existsSync(authDir)) {
                console.log('🗑️ Limpando sessão anterior...');
                const files = fs.readdirSync(authDir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(authDir, file));
                });
                console.log('✅ Sessão anterior removida');
            }
        } catch (e) {
            console.log('⚠️ Erro ao limpar sessão:', e.message);
        }
        
        // Aguardar um pouco antes de conectar
        console.log('⏳ Aguardando para reconectar...');
        setTimeout(() => {
            connectWhatsApp();
        }, 2000);
    });
    
    // Enviar mensagem WhatsApp
    socket.on('send-whatsapp', async (data) => {
        const { chatId, message, image } = data;
        const result = await sendWhatsAppMessage(chatId, message, image);
        socket.emit('whatsapp-result', result);
    });
    
    // Verificar status
    socket.on('check-status', () => {
        socket.emit('whatsapp-status', { status: isConnected ? 'online' : 'offline' });
    });
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
