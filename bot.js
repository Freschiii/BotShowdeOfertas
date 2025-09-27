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
        
        this.socket.on('whatsapp-qr', (qrCodeDataURL) => {
            console.log('📱 QR Code visual recebido no frontend:', qrCodeDataURL ? 'Sim' : 'Não');
            console.log('📱 QR Code visual data:', qrCodeDataURL ? qrCodeDataURL.substring(0, 50) + '...' : 'Nenhum');
            this.showVisualQRCode(qrCodeDataURL);
            this.showMessage('QR Code visual gerado! Escaneie com seu WhatsApp.', 'success');
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

    // Mostrar QR Code visual do servidor
    showVisualQRCode(qrCodeDataURL) {
        console.log('📱 Mostrando QR Code visual:', qrCodeDataURL ? 'Sim' : 'Não');
        
        // REMOVER QUALQUER MODAL ANTERIOR
        const existingModal = document.getElementById('qrCode');
        const existingOverlay = document.getElementById('qrOverlay');
        if (existingModal) existingModal.remove();
        if (existingOverlay) existingOverlay.remove();
        
        console.log('📱 Criando modal do QR Code visual...');
        
        // Criar overlay de fundo
        const overlay = document.createElement('div');
        overlay.id = 'qrOverlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.9) !important;
            z-index: 99999 !important;
            display: block !important;
        `;
        document.body.appendChild(overlay);
        
        // Criar container do QR Code
        const qrContainer = document.createElement('div');
        qrContainer.id = 'qrCode';
        qrContainer.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: white !important;
            padding: 30px !important;
            border-radius: 20px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
            z-index: 100000 !important;
            text-align: center !important;
            max-width: 80vw !important;
            max-height: 80vh !important;
            overflow: auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            border: 5px solid #25d366 !important;
        `;
        
        qrContainer.innerHTML = `
            <div style="background: #25d366; color: white; padding: 20px; border-radius: 15px 15px 0 0; margin: -30px -30px 20px -30px;">
                <h2 style="margin: 0; font-size: 1.5rem;">📱 Conectar WhatsApp</h2>
            </div>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #25d366;">
                <img src="${qrCodeDataURL}" alt="QR Code para conectar WhatsApp" style="max-width: 300px; height: auto; border-radius: 8px; border: 2px solid #25d366; background: white; padding: 10px;">
            </div>
            <p style="margin-top: 20px; font-size: 1.2rem; color: #333; font-weight: 700;">
                📱 Escaneie este QR Code com seu WhatsApp
            </p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #25d366;">
                <p style="margin: 5px 0; font-size: 1rem; color: #333;">
                    <strong>📱 Como escanear:</strong><br>
                    • Abra o WhatsApp no seu celular<br>
                    • Toque em "Dispositivos conectados"<br>
                    • Toque em "Conectar um dispositivo"<br>
                    • Escaneie este QR Code
                </p>
            </div>
            <button onclick="document.getElementById('qrCode').remove(); document.getElementById('qrOverlay').remove();" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                cursor: pointer;
                margin-top: 20px;
                font-weight: 700;
                font-size: 1.1rem;
                box-shadow: 0 5px 15px rgba(255,107,53,0.3);
            ">❌ Fechar</button>
        `;
        
        document.body.appendChild(qrContainer);
        
        console.log('✅ QR Code visual inserido no HTML');
        console.log('✅ Modal do QR Code visual criado com sucesso');
        console.log('🔍 Modal deve estar visível agora com QR Code visual');
    }

    // Mostrar QR Code ASCII do terminal
    showASCIIQRCode(qrCodeASCII) {
        console.log('📱 Mostrando QR Code ASCII:', qrCodeASCII ? 'Sim' : 'Não');
        console.log('📱 QR Code completo:', qrCodeASCII);
        
        // REMOVER QUALQUER MODAL ANTERIOR
        const existingModal = document.getElementById('qrCode');
        const existingOverlay = document.getElementById('qrOverlay');
        if (existingModal) existingModal.remove();
        if (existingOverlay) existingOverlay.remove();
        
        console.log('📱 Criando novo modal do QR Code...');
        
        // Criar overlay de fundo
        const overlay = document.createElement('div');
        overlay.id = 'qrOverlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.9) !important;
            z-index: 99999 !important;
            display: block !important;
        `;
        document.body.appendChild(overlay);
        
        // Criar container do QR Code
        const qrContainer = document.createElement('div');
        qrContainer.id = 'qrCode';
        qrContainer.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: white !important;
            padding: 30px !important;
            border-radius: 20px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
            z-index: 100000 !important;
            text-align: center !important;
            max-width: 80vw !important;
            max-height: 80vh !important;
            overflow: auto !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            border: 5px solid #25d366 !important;
        `;
        
        qrContainer.innerHTML = `
            <div style="background: #25d366; color: white; padding: 20px; border-radius: 15px 15px 0 0; margin: -30px -30px 20px -30px;">
                <h2 style="margin: 0; font-size: 1.5rem;">📱 Conectar WhatsApp</h2>
            </div>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; max-height: 400px; overflow: auto; border: 2px solid #25d366;">
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="color: #666; margin-bottom: 10px; font-size: 0.9rem;">QR Code Visual:</p>
                    <div style="background: #000; padding: 10px; border-radius: 5px; display: inline-block;">
                        <canvas id="qrCanvas" width="300" height="300" style="max-width: 300px; height: auto; border-radius: 5px; background: white;"></canvas>
                    </div>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                    <p style="margin: 0; font-size: 0.8rem; color: #856404;">
                        <strong>💡 Dica:</strong> QR Code gerado diretamente no navegador. Escaneie com seu WhatsApp.
                    </p>
                </div>
            </div>
            <p style="margin-top: 20px; font-size: 1.2rem; color: #333; font-weight: 700;">
                📱 Escaneie este QR Code com seu WhatsApp
            </p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #25d366;">
                <p style="margin: 5px 0; font-size: 1rem; color: #333;">
                    <strong>📱 Como escanear:</strong><br>
                    • Abra o WhatsApp no seu celular<br>
                    • Toque em "Dispositivos conectados"<br>
                    • Toque em "Conectar um dispositivo"<br>
                    • Escaneie este QR Code
                </p>
            </div>
            <button onclick="document.getElementById('qrCode').remove(); document.getElementById('qrOverlay').remove();" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                cursor: pointer;
                margin-top: 20px;
                font-weight: 700;
                font-size: 1.1rem;
                box-shadow: 0 5px 15px rgba(255,107,53,0.3);
            ">❌ Fechar</button>
        `;
        
        document.body.appendChild(qrContainer);
        
        // Gerar QR Code usando a biblioteca QRCode
        this.generateQRCodeFromASCII(qrCodeASCII);
        
        console.log('✅ Modal do QR Code criado com sucesso');
        console.log('🔍 Modal deve estar visível agora com QR Code visual');
        
        // TESTE VISUAL - Adicionar animação
        qrContainer.style.animation = 'pulse 2s infinite';
        
        // Adicionar CSS de animação se não existir
        if (!document.getElementById('qrAnimation')) {
            const style = document.createElement('style');
            style.id = 'qrAnimation';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Gerar QR Code usando biblioteca QRCode
    generateQRCodeFromASCII(qrCodeASCII) {
        try {
            console.log('🔄 Gerando QR Code com biblioteca QRCode...');
            
            // Extrair URL do QR Code ASCII (geralmente está no final)
            const lines = qrCodeASCII.split('\n');
            let qrUrl = '';
            
            // Procurar por URL no QR Code ASCII
            for (let line of lines) {
                if (line.includes('https://') || line.includes('http://')) {
                    qrUrl = line.trim();
                    break;
                }
            }
            
            console.log('📱 URL encontrada:', qrUrl);
            
            if (qrUrl) {
                // Usar a biblioteca QRCode para gerar QR Code visual
                const canvas = document.getElementById('qrCanvas');
                if (canvas && typeof QRCode !== 'undefined') {
                    QRCode.toCanvas(canvas, qrUrl, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    }, (error) => {
                        if (error) {
                            console.error('❌ Erro ao gerar QR Code:', error);
                            this.showFallbackQRCode();
                        } else {
                            console.log('✅ QR Code gerado com sucesso!');
                        }
                    });
                } else {
                    console.error('❌ Canvas ou biblioteca QRCode não encontrada');
                    this.showFallbackQRCode();
                }
            } else {
                console.error('❌ URL não encontrada no QR Code ASCII');
                this.showFallbackQRCode();
            }
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code:', error);
            this.showFallbackQRCode();
        }
    }
    
    // Mostrar QR Code de fallback
    showFallbackQRCode() {
        console.log('🔄 Mostrando QR Code de fallback...');
        
        const canvas = document.getElementById('qrCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Fundo branco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar padrão QR Code simples
            ctx.fillStyle = '#000000';
            
            // Cantos do QR Code
            ctx.fillRect(20, 20, 60, 60);
            ctx.fillRect(220, 20, 60, 60);
            ctx.fillRect(20, 220, 60, 60);
            
            // Linhas horizontais
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(100 + i * 5, 100, 3, 100);
            }
            
            // Linhas verticais
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(100, 100 + i * 5, 100, 3);
            }
            
            console.log('✅ QR Code de fallback criado');
        }
    }
    
    // Converter QR Code ASCII para imagem visual
    convertASCIIToImage(qrCodeASCII) {
        try {
            console.log('🔄 Convertendo QR Code ASCII para imagem...');
            console.log('📱 QR Code ASCII recebido:', qrCodeASCII ? 'Sim' : 'Não');
            
            if (!qrCodeASCII) {
                console.error('❌ QR Code ASCII vazio');
                return this.createFallbackQRCode();
            }
            
            // Criar canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Limpar e processar o QR Code ASCII
            const lines = qrCodeASCII.split('\n').filter(line => line.trim().length > 0);
            console.log('📱 Linhas do QR Code:', lines.length);
            
            if (lines.length === 0) {
                console.error('❌ Nenhuma linha válida encontrada');
                return this.createFallbackQRCode();
            }
            
            const width = lines[0].length;
            const height = lines.length;
            
            console.log('📱 Dimensões:', width + 'x' + height);
            
            // Definir tamanho do canvas
            const cellSize = 6;
            canvas.width = width * cellSize;
            canvas.height = height * cellSize;
            
            // Preencher fundo branco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar QR Code
            ctx.fillStyle = '#000000';
            let pixelsDrawn = 0;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = lines[y] && lines[y][x];
                    // Verificar se é um caractere que representa pixel preto
                    if (char && (char === '█' || char === '#' || char === '*' || char === '1' || char === 'X' || char === 'x')) {
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                        pixelsDrawn++;
                    }
                }
            }
            
            console.log('📱 Pixels desenhados:', pixelsDrawn);
            
            if (pixelsDrawn === 0) {
                console.error('❌ Nenhum pixel foi desenhado');
                return this.createFallbackQRCode();
            }
            
            // Converter para DataURL
            const dataURL = canvas.toDataURL('image/png');
            console.log('✅ QR Code convertido para imagem:', dataURL.substring(0, 50) + '...');
            
            return dataURL;
        } catch (error) {
            console.error('❌ Erro ao converter QR Code ASCII:', error);
            return this.createFallbackQRCode();
        }
    }
    
    // Criar QR Code de fallback
    createFallbackQRCode() {
        console.log('🔄 Criando QR Code de fallback...');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 200;
        
        // Fundo branco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 200, 200);
        
        // Desenhar padrão QR Code simples
        ctx.fillStyle = '#000000';
        
        // Cantos do QR Code
        ctx.fillRect(10, 10, 30, 30);
        ctx.fillRect(160, 10, 30, 30);
        ctx.fillRect(10, 160, 30, 30);
        
        // Linhas horizontais
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(50 + i * 5, 50, 3, 100);
        }
        
        // Linhas verticais
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(50, 50 + i * 5, 100, 3);
        }
        
        return canvas.toDataURL('image/png');
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
