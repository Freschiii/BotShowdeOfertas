const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir arquivos estáticos
app.use(express.static('.'));

// Estado do WhatsApp
let whatsappClient = null;
let isConnected = false;

// Função para conectar WhatsApp
async function connectWhatsApp() {
    try {
        console.log('Iniciando WhatsApp Web.js...');
        
        // Limpar cliente anterior
        if (whatsappClient) {
            await whatsappClient.destroy();
        }
        
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
        
        // Criar novo cliente
        whatsappClient = new Client({
            authStrategy: new LocalAuth({
                clientId: "whatsapp-bot"
            }),
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

        // Evento: QR Code gerado
        whatsappClient.on('qr', (qr) => {
            console.log('QR Code gerado!');
            console.log('QR Code no terminal:');
            qrcode.generate(qr, { small: true });
            
            // Gerar QR Code ASCII para o frontend
            qrcode.generate(qr, { small: true }, (qrCodeASCII) => {
                // Enviar QR Code ASCII para o frontend
                io.emit('whatsapp-qr-ascii', qrCodeASCII);
                console.log('QR Code ASCII enviado para o frontend');
            });
            
            // Enviar QR Code visual para o frontend
            qrcode.toDataURL(qr).then(qrCodeDataURL => {
                io.emit('whatsapp-qr', qrCodeDataURL);
                console.log('QR Code visual enviado para o frontend');
            });
        });

        // Evento: Cliente pronto
        whatsappClient.on('ready', () => {
            console.log('WhatsApp conectado com sucesso!');
            isConnected = true;
            io.emit('whatsapp-status', { status: 'online' });
        });

        // Evento: Cliente autenticado
        whatsappClient.on('authenticated', () => {
            console.log('WhatsApp autenticado!');
        });

        // Evento: Falha na autenticação
        whatsappClient.on('auth_failure', (msg) => {
            console.error('Falha na autenticação:', msg);
            isConnected = false;
            io.emit('whatsapp-status', { status: 'offline' });
        });

        // Evento: Cliente desconectado
        whatsappClient.on('disconnected', (reason) => {
            console.log('WhatsApp desconectado:', reason);
            isConnected = false;
            io.emit('whatsapp-status', { status: 'offline' });
        });

        // Inicializar cliente
        await whatsappClient.initialize();

    } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
        isConnected = false;
        io.emit('whatsapp-status', { status: 'offline' });
    }
}

// Função para verificar se preview carregou
async function waitForPreviewLoad(message) {
    // Verificar se a mensagem contém links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    
    if (!urls || urls.length === 0) {
        console.log('📱 WhatsApp: Nenhum link encontrado, enviando imediatamente');
        return true;
    }
    
    console.log('📱 WhatsApp: Links encontrados, aguardando preview carregar...');
    console.log('📱 WhatsApp: URLs detectadas:', urls);
    
    // Aguardar um tempo para o preview carregar
    await new Promise(resolve => setTimeout(resolve, 8000)); // 8 segundos
    
    console.log('📱 WhatsApp: Preview deve estar carregado');
    return true;
}

// Função para enviar mensagem WhatsApp
async function sendWhatsAppMessage(chatId, message, image) {
    try {
        if (!whatsappClient || !isConnected) {
            throw new Error('WhatsApp não está conectado');
        }

        if (image) {
            console.log('🖼️ Processando imagem WhatsApp:', {
                imageLength: image.length,
                imageStart: image.substring(0, 50) + '...',
                isBase64: image.startsWith('data:')
            });
            
            // A imagem já deve vir como base64 do frontend
            let imageData;
            if (typeof image === 'string' && image.startsWith('data:')) {
                // Já é base64
                imageData = image;
                console.log('✅ Imagem é base64 válida');
            } else {
                console.log('❌ Formato de imagem inválido:', typeof image);
                throw new Error('Formato de imagem não suportado. Use base64.');
            }

            // Extrair mime type e dados base64
            const [mimeType, base64Data] = imageData.split(',');
            const mediaType = mimeType.split(':')[1].split(';')[0] || 'image/jpeg';
            
            console.log('🖼️ Criando MessageMedia:', {
                mediaType,
                base64Length: base64Data.length
            });
            
            // Criar MessageMedia com a imagem
            const media = new MessageMedia(mediaType, base64Data, 'imagem.jpg');
            
            console.log('📤 Enviando mensagem com imagem para:', chatId);
            // Enviar mensagem com imagem
            await whatsappClient.sendMessage(chatId, media, { caption: message });
            console.log('✅ Mensagem com imagem enviada com sucesso!');
            return { success: true, message: 'Mensagem com imagem enviada!' };
        } else {
            // Aguardar preview carregar para mensagens com links
            await waitForPreviewLoad(message);
            
            // Enviar apenas texto
            await whatsappClient.sendMessage(chatId, message);
            return { success: true, message: 'Mensagem enviada!' };
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return { success: false, message: error.message };
    }
}

// WebSocket para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    // Conectar WhatsApp
    socket.on('connect-whatsapp', () => {
        console.log('Solicitação para conectar WhatsApp');
        connectWhatsApp();
    });
    
    // Enviar mensagem WhatsApp
    socket.on('send-whatsapp', async (data) => {
        console.log('📱 Enviando mensagem WhatsApp:', {
            chatId: data.chatId,
            hasMessage: !!data.message,
            hasImage: !!data.image,
            imageType: data.image ? typeof data.image : 'none'
        });
        
        const { chatId, message, image } = data;
        const result = await sendWhatsAppMessage(chatId, message, image);
        
        console.log('📱 Resultado WhatsApp:', result);
        socket.emit('whatsapp-result', result);
    });
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nDesligando servidor...');
    if (whatsappClient) {
        await whatsappClient.destroy();
    }
    process.exit(0);
});
