// Elementos DOM
const elements = {
    // Botões de conexão
    connectWhatsApp: document.getElementById('connectWhatsApp'),
    connectTelegram: document.getElementById('connectTelegram'),
    
    // Campos de configuração
    telegramToken: document.getElementById('telegramToken'),
    whatsappGroup: document.getElementById('whatsappGroup'),
    telegramGroup: document.getElementById('telegramGroup'),
    saveGroups: document.getElementById('saveGroups'),
    
    // QR Code
    whatsappQR: document.getElementById('whatsappQR'),
    qrCode: document.getElementById('qrCode'),
    
    // Envio de mensagens
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    messageInput: document.getElementById('messageInput'),
    sendToWhatsApp: document.getElementById('sendToWhatsApp'),
    sendToTelegram: document.getElementById('sendToTelegram'),
    sendMessage: document.getElementById('sendMessage')
};

// Estado da aplicação
let selectedImage = null;
let imageUrl = null;

// Event Listeners
elements.connectWhatsApp.addEventListener('click', connectWhatsApp);
elements.connectTelegram.addEventListener('click', connectTelegram);
elements.saveGroups.addEventListener('click', saveGroups);
elements.imageInput.addEventListener('change', handleImageUpload);
elements.sendMessage.addEventListener('click', sendMessage);

// Conectar WhatsApp
async function connectWhatsApp() {
    try {
        // Mostrar QR Code
        elements.whatsappQR.style.display = 'block';
        elements.connectWhatsApp.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        elements.connectWhatsApp.disabled = true;
        
        // Conectar WhatsApp real
        await botManager.connectWhatsApp();
        
        // NÃO ESCONDER O QR CODE - DEIXAR NA TELA ATÉ ESCANEAR
        // O QR Code só será escondido quando o WhatsApp realmente conectar
        
    } catch (error) {
        elements.connectWhatsApp.innerHTML = '<i class="fas fa-qrcode"></i> Conectar WhatsApp';
        elements.connectWhatsApp.disabled = false;
        elements.whatsappQR.style.display = 'none';
    }
}

// Conectar Telegram
async function connectTelegram() {
    const token = elements.telegramToken.value.trim();
    
    if (!token) {
        botManager.showMessage('Digite o token do Telegram Bot', 'error');
        return;
    }
    
    try {
        elements.connectTelegram.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        elements.connectTelegram.disabled = true;
        
        await botManager.connectTelegram(token);
        
        elements.connectTelegram.innerHTML = '<i class="fas fa-check"></i> Conectado';
        elements.connectTelegram.disabled = false;
        
    } catch (error) {
        elements.connectTelegram.innerHTML = '<i class="fas fa-link"></i> Conectar';
        elements.connectTelegram.disabled = false;
    }
}

// Salvar grupos
function saveGroups() {
    const whatsappGroup = elements.whatsappGroup.value.trim();
    const telegramGroup = elements.telegramGroup.value.trim();
    
    if (!whatsappGroup && !telegramGroup) {
        botManager.showMessage('Configure pelo menos um grupo', 'error');
        return;
    }
    
    botManager.setGroups(whatsappGroup, telegramGroup);
}

// Upload de imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
        botManager.showMessage('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        botManager.showMessage('A imagem é muito grande. Máximo 10MB', 'error');
        return;
    }

    selectedImage = file;
    
    // Criar URL para preview
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    }
    imageUrl = URL.createObjectURL(file);
    
    // Mostrar preview
    elements.imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview da imagem">`;
    elements.imagePreview.classList.remove('empty');
    
    botManager.showMessage('Imagem carregada com sucesso!', 'success');
}

// Enviar mensagem
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message) {
        botManager.showMessage('Digite uma mensagem primeiro!', 'error');
        return;
    }

    if (!selectedImage) {
        botManager.showMessage('Selecione uma imagem primeiro!', 'error');
        return;
    }

    // Verificar se pelo menos um bot está conectado
    const sendToWhatsApp = elements.sendToWhatsApp.checked;
    const sendToTelegram = elements.sendToTelegram.checked;
    
    if (!sendToWhatsApp && !sendToTelegram) {
        botManager.showMessage('Selecione pelo menos uma plataforma!', 'error');
        return;
    }

    if (sendToWhatsApp && !botManager.isConnected.whatsapp) {
        botManager.showMessage('WhatsApp Bot não está conectado!', 'error');
        return;
    }

    if (sendToTelegram && !botManager.isConnected.telegram) {
        botManager.showMessage('Telegram Bot não está conectado!', 'error');
        return;
    }

    try {
        elements.sendMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        elements.sendMessage.disabled = true;
        
        // Enviar mensagem
        const platforms = {
            whatsapp: sendToWhatsApp,
            telegram: sendToTelegram
        };
        
        // Converter imagem para base64 se necessário
        let imageToSend = null;
        if (selectedImage) {
            console.log('🖼️ Processando imagem para envio:', {
                hasSelectedImage: !!selectedImage,
                hasImageUrl: !!imageUrl,
                imageUrlType: imageUrl ? imageUrl.substring(0, 20) + '...' : 'none'
            });
            
            if (imageUrl && imageUrl.startsWith('blob:')) {
                console.log('🖼️ Convertendo blob para base64...');
                // Converter blob URL para base64
                try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    imageToSend = base64;
                    console.log('✅ Imagem convertida para base64:', base64.substring(0, 50) + '...');
                } catch (error) {
                    console.error('❌ Erro ao converter imagem:', error);
                    imageToSend = imageUrl;
                }
            } else {
                imageToSend = imageUrl || selectedImage;
                console.log('🖼️ Usando imagem direta:', typeof imageToSend);
            }
        } else {
            console.log('❌ Nenhuma imagem selecionada');
        }
        
        const results = await botManager.sendMessage(message, imageToSend, platforms);
        
        // Mostrar resultados
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        if (successCount === totalCount) {
            botManager.showMessage(`Mensagem enviada com sucesso para ${successCount} plataforma(s)!`, 'success');
        } else if (successCount > 0) {
            botManager.showMessage(`Mensagem enviada para ${successCount} de ${totalCount} plataforma(s)`, 'success');
        } else {
            botManager.showMessage('Erro ao enviar mensagem para todas as plataformas', 'error');
        }
        
    } catch (error) {
        botManager.showMessage('Erro ao enviar mensagem: ' + error.message, 'error');
    } finally {
        elements.sendMessage.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
        elements.sendMessage.disabled = false;
    }
}

// Baixar imagem automaticamente
function downloadImage() {
    if (!selectedImage) {
        return;
    }

    try {
        // Criar link de download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `produto-${Date.now()}.jpg`;
        link.target = '_blank';
        
        // Adicionar ao DOM temporariamente
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Erro ao baixar imagem:', error);
    }
}


// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Show de Ofertas Bot carregado!');
    
    // Focar no campo de mensagem
    elements.messageInput.focus();
    
    // Adicionar placeholder dinâmico
    const placeholders = [
        '🔥 OFERTA IMPERDÍVEL! 🔥\n\nProduto incrível com preço especial!\n💰 Apenas R$ 99,90!\n\n⚡ Corre que é por tempo limitado!',
        '🚨 PROMOÇÃO RELÂMPAGO! 🚨\n\nProduto com desconto especial!\n🎯 Não perca essa oportunidade!\n\n🛒 Compre agora!',
        '💥 SUPER OFERTA! 💥\n\nProduto com preço imperdível!\n🎁 Aproveite essa chance única!\n\n🔥 Últimas unidades!'
    ];
    
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    elements.messageInput.placeholder = randomPlaceholder;
    
    // Inicializar interface de descoberta
    initializeDiscoveryInterface();
    
    // Adicionar salvamento automático dos campos
    setupAutoSave();
});

// Configurar salvamento automático
function setupAutoSave() {
    // Salvar automaticamente quando os campos são alterados
    const fieldsToSave = ['whatsappGroup', 'telegramToken', 'telegramGroup'];
    
    fieldsToSave.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                // Atualizar valor no botManager
                if (fieldId === 'whatsappGroup') {
                    botManager.whatsappGroup = this.value;
                } else if (fieldId === 'telegramToken') {
                    botManager.telegramToken = this.value;
                } else if (fieldId === 'telegramGroup') {
                    botManager.telegramGroup = this.value;
                }
                
                // Salvar automaticamente
                botManager.saveSettings();
                console.log(`Campo ${fieldId} salvo automaticamente:`, this.value);
                
                // Mostrar indicador visual
                showAutoSaveIndicator();
            });
        }
    });
}

// Mostrar indicador de salvamento automático
function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
        
        // Esconder após 2 segundos
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

// Inicializar interface de descoberta
function initializeDiscoveryInterface() {
    const discoveryContainer = document.getElementById('discoveryInterface');
    if (discoveryContainer) {
        discoveryContainer.innerHTML = groupDiscoverer.createDiscoveryInterface();
        
        // Adicionar event listeners
        document.getElementById('discoverWhatsApp')?.addEventListener('click', discoverWhatsAppChannels);
        document.getElementById('discoverTelegram')?.addEventListener('click', discoverTelegramChannels);
    }
}

// Descobrir canais do WhatsApp
async function discoverWhatsAppChannels() {
    try {
        const button = document.getElementById('discoverWhatsApp');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Descobrindo...';
        button.disabled = true;
        
        // Mostrar instruções em vez de tentar descobrir automaticamente
        groupDiscoverer.displayWhatsAppInstructions();
        
        button.innerHTML = '<i class="fas fa-search"></i> Mostrar Instruções WhatsApp';
        button.disabled = false;
        
        groupDiscoverer.showMessage('Instruções carregadas! Siga os passos para descobrir o ID do canal.', 'info');
        
    } catch (error) {
        const button = document.getElementById('discoverWhatsApp');
        button.innerHTML = '<i class="fas fa-search"></i> Descobrir Canais WhatsApp';
        button.disabled = false;
        groupDiscoverer.showMessage('Erro ao descobrir canais: ' + error.message, 'error');
    }
}

// Descobrir canais do Telegram
async function discoverTelegramChannels() {
    try {
        const tokenInput = document.getElementById('telegramTokenInput');
        const token = tokenInput.value.trim();
        
        if (!token) {
            groupDiscoverer.showMessage('Digite o token do Telegram Bot primeiro!', 'error');
            return;
        }
        
        const button = document.getElementById('discoverTelegram');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Descobrindo...';
        button.disabled = true;
        
        const channels = await groupDiscoverer.discoverTelegramChannels(token);
        groupDiscoverer.displayGroups(channels, 'telegramGroups');
        
        button.innerHTML = '<i class="fas fa-search"></i> Descobrir Canais Telegram';
        button.disabled = false;
        
        if (channels.length > 0) {
            groupDiscoverer.showMessage(`${channels.length} canal(is) encontrado(s)!`, 'success');
        } else {
            groupDiscoverer.showMessage('Nenhum canal encontrado. Adicione o bot aos canais primeiro.', 'error');
        }
        
    } catch (error) {
        const button = document.getElementById('discoverTelegram');
        button.innerHTML = '<i class="fas fa-search"></i> Descobrir Canais Telegram';
        button.disabled = false;
        groupDiscoverer.showMessage('Erro ao descobrir canais: ' + error.message, 'error');
    }
}

// FORÇAR STATUS INICIAL COMO OFFLINE
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o botManager esteja carregado
    setTimeout(() => {
        if (typeof botManager !== 'undefined') {
            botManager.isConnected.whatsapp = false;
            botManager.isConnected.telegram = false;
            botManager.updateStatus('whatsapp', 'offline');
            botManager.updateStatus('telegram', 'offline');
        }
    }, 100);
});