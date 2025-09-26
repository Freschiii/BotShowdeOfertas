// Bot Manager para WhatsApp e Telegram
class BotManager {
    constructor() {
        this.whatsappBot = null;
        this.telegramBot = null;
        this.whatsappGroup = null;
        this.telegramGroup = null;
        this.isConnected = {
            whatsapp: false,
            telegram: false
        };
        
        // WebSocket para comunicação com servidor
        this.socket = null;
        this.serverUrl = 'http://localhost:3000';
        
        this.initializeBots();
        this.initializeWebSocket();
    }

    // Inicializar WebSocket
    initializeWebSocket() {
        try {
            // Carregar Socket.IO do CDN
            if (typeof io !== 'undefined') {
                this.socket = io(this.serverUrl);
                this.setupWebSocketListeners();
            } else {
                console.log('Socket.IO não carregado, usando modo offline');
            }
        } catch (error) {
            console.log('WebSocket não disponível, usando modo offline');
        }
    }

    // Configurar listeners do WebSocket
    setupWebSocketListeners() {
        if (!this.socket) return;

        this.socket.on('whatsapp-qr', (qrCodeDataURL) => {
            console.log('QR Code visual recebido no frontend:', qrCodeDataURL ? 'Sim' : 'Não');
            this.showRealQRCode(qrCodeDataURL);
            this.showMessage('QR Code gerado! Escaneie com seu WhatsApp.', 'success');
        });

        this.socket.on('whatsapp-qr-ascii', (qrCodeASCII) => {
            console.log('QR Code ASCII recebido no frontend:', qrCodeASCII ? 'Sim' : 'Não');
            this.showASCIIQRCode(qrCodeASCII);
        });

        this.socket.on('whatsapp-status', (data) => {
            // Só atualizar status quando for real
            if (data.status === 'online') {
                this.isConnected.whatsapp = true;
                this.updateStatus('whatsapp', 'online');
                this.showMessage('WhatsApp conectado com sucesso!', 'success');
                // ESCONDER QR CODE APENAS QUANDO REALMENTE CONECTAR
                const qrContainer = document.getElementById('whatsappQR');
                if (qrContainer) {
                    qrContainer.style.display = 'none';
                }
            } else if (data.status === 'offline') {
                this.isConnected.whatsapp = false;
                this.updateStatus('whatsapp', 'offline');
            } else if (data.status === 'connecting') {
                this.updateStatus('whatsapp', 'connecting');
            }
        });

        this.socket.on('whatsapp-result', (result) => {
            if (result.success) {
                this.showMessage('Mensagem WhatsApp enviada!', 'success');
            } else {
                this.showMessage('Erro ao enviar WhatsApp: ' + result.message, 'error');
            }
        });

        this.socket.on('whatsapp-error', (error) => {
            this.showMessage('Erro WhatsApp: ' + error.message, 'error');
        });
    }

    // Inicializar bots
    initializeBots() {
        this.loadSettings();
        // FORÇAR STATUS INICIAL COMO OFFLINE
        this.isConnected.whatsapp = false;
        this.isConnected.telegram = false;
        this.updateStatus('whatsapp', 'offline');
        this.updateStatus('telegram', 'offline');
    }

    // Carregar configurações salvas
    loadSettings() {
        const settings = localStorage.getItem('botSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.whatsappGroup = parsed.whatsappGroup;
            this.telegramToken = parsed.telegramToken;
            this.telegramGroup = parsed.telegramGroup;
            
            // Preencher campos
            if (document.getElementById('whatsappGroup')) {
                document.getElementById('whatsappGroup').value = this.whatsappGroup || '';
            }
            if (document.getElementById('telegramToken')) {
                document.getElementById('telegramToken').value = this.telegramToken || '';
            }
            if (document.getElementById('telegramGroup')) {
                document.getElementById('telegramGroup').value = this.telegramGroup || '';
            }
            
            console.log('Configurações carregadas:', parsed);
        }
    }

    // Salvar configurações
    saveSettings() {
        const settings = {
            whatsappGroup: this.whatsappGroup,
            telegramToken: this.telegramToken,
            telegramGroup: this.telegramGroup
        };
        localStorage.setItem('botSettings', JSON.stringify(settings));
        console.log('Configurações salvas:', settings);
    }

    // Conectar WhatsApp Bot
    async connectWhatsApp() {
        try {
            // Só mostrar status real
            this.isConnected.whatsapp = false;
            this.updateStatus('whatsapp', 'offline');
            
            if (this.socket) {
                // Usar WebSocket real
                this.socket.emit('connect-whatsapp');
                // Não mostrar mensagem até ter QR Code real
            } else {
                // Sem servidor = sem WhatsApp
                this.showMessage('Servidor não disponível. WhatsApp não funciona.', 'error');
            }
            
        } catch (error) {
            this.updateStatus('whatsapp', 'offline');
            this.showMessage('Erro ao conectar WhatsApp Bot: ' + error.message, 'error');
        }
    }

    // Gerar QR Code real (apenas via servidor)
    async generateRealQRCode() {
        // QR Code só é gerado pelo servidor real
        throw new Error('QR Code só é gerado pelo servidor real');
    }

    // Mostrar QR Code real do servidor
    showRealQRCode(qrCodeDataURL) {
        console.log('Mostrando QR Code visual:', qrCodeDataURL ? 'Sim' : 'Não');
        const qrContainer = document.getElementById('qrCode');
        if (qrContainer) {
            qrContainer.innerHTML = `
                <img src="${qrCodeDataURL}" alt="QR Code para conectar WhatsApp" style="max-width: 200px; height: auto; border-radius: 8px;">
                <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    Escaneie este QR Code com seu WhatsApp
                </p>
            `;
            console.log('QR Code visual inserido no HTML');
        } else {
            console.error('Container do QR Code não encontrado');
        }
    }

    // Mostrar QR Code ASCII do terminal
    showASCIIQRCode(qrCodeASCII) {
        console.log('Mostrando QR Code ASCII:', qrCodeASCII ? 'Sim' : 'Não');
        const qrContainer = document.getElementById('qrCode');
        if (qrContainer) {
            // Adicionar QR Code ASCII abaixo do visual
            const asciiContainer = document.createElement('div');
            asciiContainer.id = 'qrCodeASCII';
            asciiContainer.innerHTML = `
                <h4 style="margin-top: 20px; color: #666;">QR Code ASCII (do terminal):</h4>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1; overflow-x: auto; white-space: pre; color: #333;">${qrCodeASCII}</pre>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #666;">
                    Você pode escanear qualquer um dos dois QR Codes
                </p>
            `;
            qrContainer.appendChild(asciiContainer);
            console.log('QR Code ASCII inserido no HTML');
        } else {
            console.error('Container do QR Code não encontrado');
        }
    }

    // QR Code só é gerado pelo servidor real
    showQRCode(qrData) {
        // Não usar fallback - só QR Code real do servidor
        throw new Error('QR Code só é gerado pelo servidor real');
    }

    // Aguardar conexão WhatsApp (apenas real)
    async waitForWhatsAppConnection() {
        // Conexão só é real via WebSocket
        throw new Error('Conexão só é real via WebSocket');
    }

    // Conectar Telegram Bot
    async connectTelegram(token) {
        try {
            if (!token) {
                throw new Error('Token do Telegram é obrigatório');
            }

            this.updateStatus('telegram', 'connecting');
            
            // Validar token real
            const isValid = await this.validateTelegramToken(token);
            if (!isValid) {
                throw new Error('Token inválido ou bot não encontrado');
            }
            
            this.telegramToken = token;
            this.isConnected.telegram = true;
            this.updateStatus('telegram', 'online');
            this.showMessage('Telegram Bot conectado com sucesso!', 'success');
            
        } catch (error) {
            this.updateStatus('telegram', 'offline');
            this.showMessage('Erro ao conectar Telegram Bot: ' + error.message, 'error');
        }
    }

    // Validar token do Telegram
    async validateTelegramToken(token) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
            const data = await response.json();
            return data.ok;
        } catch (error) {
            return false;
        }
    }

    // Enviar mensagem
    async sendMessage(message, image, platforms) {
        console.log('📤 BotManager.sendMessage chamado:', {
            hasMessage: !!message,
            hasImage: !!image,
            imageType: image ? typeof image : 'none',
            platforms: platforms,
            whatsappConnected: this.isConnected.whatsapp,
            telegramConnected: this.isConnected.telegram
        });
        
        const results = [];
        
        try {
            // Enviar para WhatsApp
            if (platforms.whatsapp && this.isConnected.whatsapp) {
                console.log('📱 Enviando para WhatsApp...');
                const whatsappResult = await this.sendToWhatsApp(message, image);
                results.push({
                    platform: 'WhatsApp',
                    success: whatsappResult.success,
                    message: whatsappResult.message
                });
            }

            // Enviar para Telegram
            if (platforms.telegram && this.isConnected.telegram) {
                console.log('📱 Enviando para Telegram...');
                const telegramResult = await this.sendToTelegram(message, image);
                results.push({
                    platform: 'Telegram',
                    success: telegramResult.success,
                    message: telegramResult.message
                });
            }

            // Adicionar ao histórico
            this.addToHistory(message, results);
            
            return results;
            
        } catch (error) {
            this.showMessage('Erro ao enviar mensagem: ' + error.message, 'error');
            return [];
        }
    }

    // Enviar mensagem com modo específico
    async sendMessageWithMode(message, whatsappData, telegramData, platforms) {
        console.log('📤 BotManager.sendMessageWithMode chamado:', {
            hasMessage: !!message,
            whatsappData: whatsappData,
            telegramData: telegramData,
            platforms: platforms,
            whatsappConnected: this.isConnected.whatsapp,
            telegramConnected: this.isConnected.telegram
        });
        
        const results = [];
        
        try {
            // Enviar para WhatsApp
            if (platforms.whatsapp && this.isConnected.whatsapp && whatsappData) {
                console.log('📱 Enviando para WhatsApp com dados específicos...');
                const whatsappResult = await this.sendToWhatsApp(whatsappData.message, whatsappData.image);
                results.push({
                    platform: 'WhatsApp',
                    success: whatsappResult.success,
                    message: whatsappResult.message
                });
            }

            // Enviar para Telegram
            if (platforms.telegram && this.isConnected.telegram && telegramData) {
                console.log('📱 Enviando para Telegram com dados específicos...');
                const telegramResult = await this.sendToTelegram(telegramData.message, telegramData.image);
                results.push({
                    platform: 'Telegram',
                    success: telegramResult.success,
                    message: telegramResult.message
                });
            }

            // Adicionar ao histórico
            this.addToHistory(message, results);
            
            return results;
            
        } catch (error) {
            this.showMessage('Erro ao enviar mensagem: ' + error.message, 'error');
            return [];
        }
    }

    // Enviar para WhatsApp (apenas real)
    async sendToWhatsApp(message, image) {
        try {
            if (!this.whatsappGroup) {
                throw new Error('Canal WhatsApp não configurado');
            }

            if (!this.isConnected.whatsapp) {
                throw new Error('WhatsApp não está conectado');
            }

            if (!this.socket) {
                throw new Error('Servidor não disponível');
            }

            // Delay para carregar preview do link (apenas quando não há imagem)
            if (!image) {
                console.log('📱 WhatsApp: Aguardando delay para carregar preview do link...');
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos de delay
                console.log('📱 WhatsApp: Delay concluído, enviando mensagem...');
            }

            // Enviar via WebSocket real
            console.log('📱 Enviando para WhatsApp via WebSocket:', {
                chatId: this.whatsappGroup,
                hasMessage: !!message,
                hasImage: !!image,
                imageType: image ? typeof image : 'none'
            });
            
            this.socket.emit('send-whatsapp', {
                chatId: this.whatsappGroup,
                message: message,
                image: image // Enviar a imagem real, não apenas o nome
            });
            
            return {
                success: true,
                message: `Mensagem enviada para o canal WhatsApp: ${this.whatsappGroup}`
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao enviar para WhatsApp: ' + error.message
            };
        }
    }

    // Enviar para Telegram
    async sendToTelegram(message, image) {
        try {
            console.log('📱 Enviando para Telegram:', { 
                hasToken: !!this.telegramToken, 
                hasGroup: !!this.telegramGroup,
                hasImage: !!image,
                token: this.telegramToken ? this.telegramToken.substring(0, 10) + '...' : 'none',
                group: this.telegramGroup || 'none'
            });
            
            if (!this.telegramToken) {
                console.log('❌ Token do Telegram não configurado');
                throw new Error('Token do Telegram não configurado');
            }

            if (!this.telegramGroup) {
                console.log('❌ Canal do Telegram não configurado');
                throw new Error('Canal do Telegram não configurado');
            }

            let response;
            
            let fileToSend = null;

            if (image) {
                console.log('📱 Telegram: Processando imagem para envio...');
                if (typeof image === 'string' && image.startsWith('data:')) {
                    // Se for base64, converter para Blob/File
                    const [mimeTypePart, base64Data] = image.split(',');
                    const mimeType = mimeTypePart.split(':')[1].split(';')[0];
                    
                    // Decodificar base64
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    fileToSend = new File([blob], 'image.jpg', { type: mimeType });
                    console.log('📱 Telegram: Converted base64 string to File object for upload.');
                } else if (typeof image === 'string' && image.startsWith('blob:')) {
                    // Se for URL blob, converter para arquivo (caso o script.js mude novamente)
                    console.log('📱 Telegram: Fetching blob URL...');
                    const res = await fetch(image);
                    const blob = await res.blob();
                    fileToSend = new File([blob], 'image.jpg', { type: blob.type });
                    console.log('📱 Telegram: Converted blob URL to File object for upload.');
                } else if (image instanceof File) {
                    // Se já for um objeto File
                    console.log('📱 Telegram: Image is already a File object.');
                    fileToSend = image;
                } else {
                    console.warn('📱 Telegram: Unexpected image format received:', typeof image, image);
                    throw new Error('Formato de imagem não suportado para Telegram.');
                }

                if (fileToSend) {
                    const formData = new FormData();
                    formData.append('chat_id', this.telegramGroup);
                    formData.append('photo', fileToSend); // Anexar o objeto File
                    formData.append('caption', message);
                    formData.append('parse_mode', 'HTML');

                    console.log('📱 Telegram: Sending photo via FormData...');
                    response = await fetch(`https://api.telegram.org/bot${this.telegramToken}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });
                } else {
                    throw new Error('Não foi possível preparar a imagem para envio.');
                }
            } else {
                // Enviar apenas texto
                console.log('📱 Telegram: Sending text message...');
                response = await fetch(`https://api.telegram.org/bot${this.telegramToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: this.telegramGroup,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            }

            const data = await response.json();
            
            console.log('📱 Resposta do Telegram:', {
                ok: data.ok,
                error: data.error_code,
                description: data.description
            });
            
            if (data.ok) {
                console.log('✅ Telegram enviado com sucesso!');
                return {
                    success: true,
                    message: `Mensagem ${image ? 'com imagem ' : ''}enviada para o canal Telegram: ${this.telegramGroup}`
                };
            } else {
                console.log('❌ Erro do Telegram:', data.description);
                throw new Error(data.description || 'Erro desconhecido');
            }
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao enviar para Telegram: ' + error.message
            };
        }
    }

    // Atualizar status dos bots
    updateStatus(platform, status) {
        const statusElement = document.getElementById(`${platform}Status`);
        if (statusElement) {
            const dot = statusElement.querySelector('.status-dot');
            const text = statusElement.querySelector('span:last-child');
            
            dot.className = `status-dot ${status}`;
            
            switch (status) {
                case 'online':
                    text.textContent = 'Conectado';
                    break;
                case 'connecting':
                    text.textContent = 'Conectando...';
                    break;
                case 'offline':
                    text.textContent = 'Desconectado';
                    break;
            }
        }
        
        // ATUALIZAR BOTÃO DO WHATSAPP
        if (platform === 'whatsapp') {
            const connectButton = document.getElementById('connectWhatsApp');
            if (connectButton) {
                switch (status) {
                    case 'online':
                        connectButton.innerHTML = '<i class="fas fa-check"></i> Conectado';
                        connectButton.className = 'btn-whatsapp connected';
                        break;
                    case 'connecting':
                        connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
                        connectButton.className = 'btn-whatsapp connecting';
                        break;
                    case 'offline':
                        connectButton.innerHTML = '<i class="fas fa-qrcode"></i> Conectar WhatsApp';
                        connectButton.className = 'btn-whatsapp';
                        break;
                }
            }
        }
    }

    // Adicionar ao histórico
    addToHistory(message, results) {
        const historyContainer = document.getElementById('messageHistory');
        const emptyMessage = historyContainer.querySelector('.empty-history');
        
        if (emptyMessage) {
            emptyMessage.remove();
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timestamp = new Date().toLocaleString('pt-BR');
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        historyItem.innerHTML = `
            <i class="fas fa-paper-plane"></i>
            <div class="history-content">
                <h4>Mensagem Enviada</h4>
                <p>${message.substring(0, 50)}${message.length > 50 ? '...' : ''}</p>
                <p>Sucesso: ${successCount}/${totalCount} plataformas</p>
            </div>
            <div class="history-time">${timestamp}</div>
        `;
        
        if (successCount === totalCount) {
            historyItem.classList.add('success');
        } else if (successCount === 0) {
            historyItem.classList.add('error');
        }
        
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    }

    // Mostrar mensagem
    showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;

        // Adicionar após o header
        const header = document.querySelector('header');
        header.appendChild(messageDiv);

        // Remover após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Configurar grupos
    setGroups(whatsappGroup, telegramGroup) {
        this.whatsappGroup = whatsappGroup;
        this.telegramGroup = telegramGroup;
        this.saveSettings();
        this.showMessage('Grupos configurados com sucesso!', 'success');
    }
}

// Instância global do bot manager
const botManager = new BotManager();
