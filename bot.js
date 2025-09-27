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
            console.log('🔌 Inicializando WebSocket...');
            console.log('🔍 io disponível:', typeof io !== 'undefined');
            console.log('🔍 serverUrl:', this.serverUrl);
            
            // Carregar Socket.IO do CDN
            if (typeof io !== 'undefined') {
                console.log('📡 Conectando ao servidor via Socket.IO...');
                this.socket = io(this.serverUrl);
                this.setupWebSocketListeners();
                console.log('✅ WebSocket configurado com sucesso');
            } else {
                console.error('❌ Socket.IO não carregado, usando modo offline');
            }
        } catch (error) {
            console.error('❌ WebSocket não disponível, usando modo offline:', error);
        }
    }

    // Configurar listeners do WebSocket
    setupWebSocketListeners() {
        if (!this.socket) return;

        this.socket.on('whatsapp-qr-ascii', (qrCodeASCII) => {
            console.log('📱 QR Code ASCII recebido no frontend:', qrCodeASCII ? 'Sim' : 'Não');
            this.showASCIIQRCode(qrCodeASCII);
            this.showMessage('QR Code gerado! Escaneie com seu WhatsApp.', 'success');
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
            console.log('🔄 BotManager.connectWhatsApp chamado');
            console.log('🔍 Socket disponível:', !!this.socket);
            
            // Só mostrar status real
            this.isConnected.whatsapp = false;
            this.updateStatus('whatsapp', 'offline');
            
            if (this.socket) {
                console.log('📡 Enviando evento connect-whatsapp via WebSocket');
                // Usar WebSocket real
                this.socket.emit('connect-whatsapp');
                this.showMessage('🔄 Conectando WhatsApp... Aguarde o QR Code.', 'info');
                // Não mostrar mensagem até ter QR Code real
            } else {
                console.error('❌ Socket não disponível');
                // Sem servidor = sem WhatsApp
                this.showMessage('Servidor não disponível. WhatsApp não funciona.', 'error');
            }
            
        } catch (error) {
            console.error('❌ Erro em connectWhatsApp:', error);
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
        console.log('📱 Mostrando QR Code visual:', qrCodeDataURL ? 'Sim' : 'Não');
        
        // Criar ou encontrar container do QR Code
        let qrContainer = document.getElementById('qrCode');
        if (!qrContainer) {
            // Criar container se não existir
            qrContainer = document.createElement('div');
            qrContainer.id = 'qrCode';
            qrContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                text-align: center;
                max-width: 90vw;
                max-height: 90vh;
            `;
            document.body.appendChild(qrContainer);
        }
        
        qrContainer.innerHTML = `
            <div style="background: #25d366; color: white; padding: 15px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px;">
                <h3 style="margin: 0; font-size: 1.2rem;">📱 Conectar WhatsApp</h3>
            </div>
            <img src="${qrCodeDataURL}" alt="QR Code para conectar WhatsApp" style="max-width: 300px; height: auto; border-radius: 8px; border: 2px solid #25d366;">
            <p style="margin-top: 15px; font-size: 1rem; color: #333; font-weight: 600;">
                Escaneie este QR Code com seu WhatsApp
            </p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                • Abra o WhatsApp no seu celular<br>
                • Toque em "Dispositivos conectados"<br>
                • Toque em "Conectar um dispositivo"<br>
                • Escaneie este QR Code
            </p>
            <button onclick="document.getElementById('qrCode').style.display='none'" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                margin-top: 15px;
                font-weight: 600;
            ">Fechar</button>
        `;
        
        console.log('✅ QR Code visual inserido no HTML');
    }

    // Mostrar QR Code ASCII do terminal
    showASCIIQRCode(qrCodeASCII) {
        console.log('📱 Mostrando QR Code ASCII:', qrCodeASCII ? 'Sim' : 'Não');
        console.log('📱 QR Code completo:', qrCodeASCII);
        
        // Criar ou encontrar container do QR Code
        let qrContainer = document.getElementById('qrCode');
        if (!qrContainer) {
            console.log('📱 Criando container do QR Code...');
            
            // Criar overlay de fundo
            const overlay = document.createElement('div');
            overlay.id = 'qrOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 9999;
            `;
            document.body.appendChild(overlay);
            
            // Criar container se não existir
            qrContainer = document.createElement('div');
            qrContainer.id = 'qrCode';
            qrContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                z-index: 10000;
                text-align: center;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
                display: block;
                visibility: visible;
            `;
            document.body.appendChild(qrContainer);
            console.log('✅ Container do QR Code criado');
        }
        
        qrContainer.innerHTML = `
            <div style="background: #25d366; color: white; padding: 15px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px;">
                <h3 style="margin: 0; font-size: 1.2rem;">📱 Conectar WhatsApp</h3>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; max-height: 300px; overflow: auto;">
                <pre style="font-family: 'Courier New', monospace; font-size: 6px; line-height: 0.8; color: #333; margin: 0; white-space: pre; overflow: auto;">${qrCodeASCII}</pre>
            </div>
            <p style="margin-top: 15px; font-size: 1rem; color: #333; font-weight: 600;">
                Escaneie este QR Code com seu WhatsApp
            </p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                • Abra o WhatsApp no seu celular<br>
                • Toque em "Dispositivos conectados"<br>
                • Toque em "Conectar um dispositivo"<br>
                • Escaneie este QR Code
            </p>
            <button onclick="document.getElementById('qrCode').style.display='none'; document.getElementById('qrOverlay').style.display='none';" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                margin-top: 15px;
                font-weight: 600;
            ">Fechar</button>
        `;
        
        // FORÇAR VISIBILIDADE
        qrContainer.style.display = 'block';
        qrContainer.style.visibility = 'visible';
        qrContainer.style.opacity = '1';
        
        console.log('✅ QR Code ASCII inserido no HTML');
        console.log('✅ Modal do QR Code deve estar visível agora');
        
        // TESTE VISUAL - Adicionar borda vermelha temporária
        qrContainer.style.border = '5px solid red';
        console.log('🔴 TESTE: Modal com borda vermelha adicionada');
        
        // Remover borda após 3 segundos
        setTimeout(() => {
            qrContainer.style.border = 'none';
            console.log('🔴 TESTE: Borda vermelha removida');
        }, 3000);
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
            console.log('📱 sendToWhatsApp chamada com:', {
                message: message,
                hasImage: !!image,
                whatsappGroup: this.whatsappGroup,
                isConnected: this.isConnected.whatsapp,
                hasSocket: !!this.socket
            });
            
            if (!this.whatsappGroup) {
                console.log('❌ Canal WhatsApp não configurado');
                throw new Error('Canal WhatsApp não configurado');
            }

            if (!this.isConnected.whatsapp) {
                console.log('❌ WhatsApp não está conectado');
                throw new Error('WhatsApp não está conectado');
            }

            if (!this.socket) {
                console.log('❌ Servidor não disponível');
                throw new Error('Servidor não disponível');
            }

            // Enviar mensagem (servidor cuida do preview)
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
