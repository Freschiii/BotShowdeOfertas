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
    sendToWhatsApp: document.getElementById('sendToWhatsApp'),
    sendToTelegram: document.getElementById('sendToTelegram'),
    sendMessage: document.getElementById('sendMessage')
};

// Estado da aplicação
let messageQueue = [];
let messageCounter = 0;

// Event Listeners
elements.connectWhatsApp.addEventListener('click', connectWhatsApp);
elements.connectTelegram.addEventListener('click', connectTelegram);
elements.saveGroups.addEventListener('click', saveGroups);
elements.sendMessage.addEventListener('click', sendMessage);

// Sistema de Abas
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado e conteúdo correspondente
            button.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    // Modo Escuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Carregar preferência salva (padrão: modo escuro)
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Salvar preferência
        localStorage.setItem('darkMode', isDark);
        
        // Atualizar ícone
        darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Inicializar primeira mensagem na fila
    initializeMessageQueue();
});

// Inicializar fila de mensagens
function initializeMessageQueue() {
    addMessageToQueue();
}

// Adicionar mensagem à fila
function addMessageToQueue() {
    messageCounter++;
    const messageId = `message_${messageCounter}`;
    
    const messageItem = {
        id: messageId,
        image: null,
        text: '',
        schedule: null
    };
    
    messageQueue.push(messageItem);
    renderMessageQueue();
    
    // Atualizar botão de adicionar mensagem
    updateAddMessageButton();
}

// Remover mensagem da fila
function removeMessageFromQueue(messageId) {
    messageQueue = messageQueue.filter(item => item.id !== messageId);
    renderMessageQueue();
    updateAddMessageButton();
}

// Atualizar botão de adicionar mensagem
function updateAddMessageButton() {
    const addBtn = document.getElementById('addMessageBtn');
    if (addBtn) {
        addBtn.remove();
    }
    
    // Criar novo botão
    const newBtn = document.createElement('button');
    newBtn.id = 'addMessageBtn';
    newBtn.className = 'add-message-btn';
    newBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Mensagem';
    newBtn.addEventListener('click', addMessageToQueue);
    
    // Inserir após a fila de mensagens
    const messageQueue = document.getElementById('messageQueue');
    messageQueue.parentNode.insertBefore(newBtn, messageQueue.nextSibling);
}

// Renderizar fila de mensagens
function renderMessageQueue() {
    const queueContainer = document.getElementById('messageQueue');
    queueContainer.innerHTML = '';
    
    messageQueue.forEach((item, index) => {
        const messageElement = createMessageElement(item, index + 1);
        queueContainer.appendChild(messageElement);
        
        // Restaurar imagem se existir
        if (item.image) {
            const preview = messageElement.querySelector('.queue-image-preview');
            preview.innerHTML = `<img src="${item.image}" alt="Preview">`;
            preview.classList.remove('empty');
        }
        
        // Restaurar texto se existir
        if (item.text) {
            const textarea = messageElement.querySelector('.queue-message-input');
            textarea.value = item.text;
        }
    });
    
    // Atualizar preview do WhatsApp
    updateWhatsAppPreview();
}

// Criar elemento de mensagem
function createMessageElement(item, number) {
    const div = document.createElement('div');
    div.className = 'message-queue-item';
    div.id = item.id;
    
    div.innerHTML = `
        <div class="queue-item-header">
            <div class="queue-item-number">Mensagem ${number}</div>
            <div class="queue-item-controls">
                ${messageQueue.length > 1 ? `<button class="queue-remove-btn" onclick="removeMessageFromQueue('${item.id}')" title="Remover mensagem">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
                <button class="queue-schedule-toggle" onclick="toggleSchedule('${item.id}')" title="Agendar mensagem">
                    <i class="fas fa-clock"></i>
                </button>
            </div>
        </div>
        
        <div class="message-content">
            <div class="image-upload">
                <input type="file" id="queue-image-${item.id}" class="queue-image-input" data-message-id="${item.id}" accept="image/*" />
                <label for="queue-image-${item.id}" class="upload-btn">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Escolher Imagem</span>
                </label>
                <div class="image-preview queue-image-preview" data-message-id="${item.id}"></div>
            </div>
            
            <div class="message-input-container">
                <textarea class="queue-message-input" data-message-id="${item.id}" placeholder="Digite sua mensagem aqui..."></textarea>
            </div>
        </div>
        
        <div class="queue-schedule-controls" id="schedule-${item.id}">
            <div class="schedule-input">
                <label>Data e hora:</label>
                <input type="datetime-local" class="queue-schedule-input" data-message-id="${item.id}" />
            </div>
        </div>
    `;
    
    // Adicionar event listeners
    const imageInput = div.querySelector('.queue-image-input');
    const messageInput = div.querySelector('.queue-message-input');
    const scheduleInput = div.querySelector('.queue-schedule-input');
    
    imageInput.addEventListener('change', (e) => handleQueueImageUpload(e, item.id));
    messageInput.addEventListener('input', (e) => updateMessageText(item.id, e.target.value));
    scheduleInput.addEventListener('change', (e) => updateMessageSchedule(item.id, e.target.value));
    
    return div;
}

// Alternar agendamento
function toggleSchedule(messageId) {
    const scheduleControls = document.getElementById(`schedule-${messageId}`);
    const toggleBtn = document.querySelector(`[onclick="toggleSchedule('${messageId}')"]`);
    
    if (scheduleControls.classList.contains('active')) {
        scheduleControls.classList.remove('active');
        toggleBtn.classList.remove('active');
        updateMessageSchedule(messageId, null);
    } else {
        scheduleControls.classList.add('active');
        toggleBtn.classList.add('active');
        
        // Definir data/hora mínima
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        const scheduleInput = scheduleControls.querySelector('.queue-schedule-input');
        scheduleInput.min = now.toISOString().slice(0, 16);
    }
}

// Manipular upload de imagem na fila
function handleQueueImageUpload(event, messageId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const messageItem = messageQueue.find(item => item.id === messageId);
        if (messageItem) {
            messageItem.image = e.target.result;
        }
        
        // Atualizar preview
        const preview = document.querySelector(`.queue-image-preview[data-message-id="${messageId}"]`);
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.remove('empty');
    };
    reader.readAsDataURL(file);
}

// Atualizar texto da mensagem
function updateMessageText(messageId, text) {
    const messageItem = messageQueue.find(item => item.id === messageId);
    if (messageItem) {
        messageItem.text = text;
        updateWhatsAppPreview();
    }
}

// Atualizar agendamento da mensagem
function updateMessageSchedule(messageId, schedule) {
    const messageItem = messageQueue.find(item => item.id === messageId);
    if (messageItem) {
        messageItem.schedule = schedule;
    }
}

// Atualizar preview do WhatsApp
function updateWhatsAppPreview() {
    const previewContainer = document.getElementById('whatsappPreview');
    if (!previewContainer) return;
    
    // Limpar preview anterior
    previewContainer.innerHTML = '';
    
    // Adicionar mensagens da fila
    messageQueue.forEach((item, index) => {
        if (item.text.trim()) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'whatsapp-message received';
            
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${item.text}</div>
                </div>
                <div class="message-time">${timeString}</div>
            `;
            
            previewContainer.appendChild(messageDiv);
        }
    });
    
    // Se não há mensagens, mostrar placeholder
    if (previewContainer.children.length === 0) {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'whatsapp-message received';
        placeholderDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">Digite sua mensagem para ver o preview...</div>
            </div>
            <div class="message-time">12:34</div>
        `;
        previewContainer.appendChild(placeholderDiv);
    }
}

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


// Enviar mensagem
async function sendMessage() {
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

    // Verificar se há mensagens na fila
    if (messageQueue.length === 0) {
        botManager.showMessage('Adicione pelo menos uma mensagem na fila!', 'error');
        return;
    }

    // Verificar se todas as mensagens têm texto
    const emptyMessages = messageQueue.filter(item => !item.text.trim());
    if (emptyMessages.length > 0) {
        botManager.showMessage('Todas as mensagens devem ter texto!', 'error');
        return;
    }

    try {
        elements.sendMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        elements.sendMessage.disabled = true;
        
        // Processar fila de mensagens
        await processMessageQueue(sendToWhatsApp, sendToTelegram);
        
    } catch (error) {
        botManager.showMessage('Erro ao enviar mensagens: ' + error.message, 'error');
    } finally {
        elements.sendMessage.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagens';
        elements.sendMessage.disabled = false;
    }
}

// Processar fila de mensagens
async function processMessageQueue(sendToWhatsApp, sendToTelegram) {
    const platforms = {
        whatsapp: sendToWhatsApp,
        telegram: sendToTelegram
    };
    
    let scheduledCount = 0;
    let immediateCount = 0;
    
    for (const messageItem of messageQueue) {
        if (messageItem.schedule) {
            // Mensagem agendada
            await scheduleQueueMessage(messageItem, platforms);
            scheduledCount++;
        } else {
            // Mensagem imediata
            await sendImmediateMessage(messageItem, platforms);
            immediateCount++;
        }
    }
    
    // Mostrar resumo
    let summary = '';
    if (immediateCount > 0) {
        summary += `${immediateCount} mensagem(ns) enviada(s) imediatamente. `;
    }
    if (scheduledCount > 0) {
        summary += `${scheduledCount} mensagem(ns) agendada(s).`;
    }
    
    botManager.showMessage(summary, 'success');
}

// Enviar mensagem imediata
async function sendImmediateMessage(messageItem, platforms) {
    const results = await botManager.sendMessage(messageItem.text, messageItem.image, platforms);
    
    const successCount = results.filter(r => r.success).length;
    botManager.showMessage(`Mensagem "${messageItem.text.substring(0, 30)}..." enviada para ${successCount} plataforma(s)`, 'info');
}

// Agendar mensagem da fila
async function scheduleQueueMessage(messageItem, platforms) {
    const scheduleTime = new Date(messageItem.schedule).getTime();
    const now = new Date().getTime();
    
    if (scheduleTime <= now) {
        botManager.showMessage('A data/hora deve ser no futuro!', 'error');
        return;
    }
    
    const delay = scheduleTime - now;
    
    botManager.showMessage(`Mensagem agendada para ${new Date(scheduleTime).toLocaleString('pt-BR')}`, 'info');
    
    // Agendar envio
    setTimeout(async () => {
        botManager.showMessage('Enviando mensagem agendada...', 'info');
        
        const results = await botManager.sendMessage(messageItem.text, messageItem.image, platforms);
        
        const successCount = results.filter(r => r.success).length;
        botManager.showMessage(`Mensagem agendada enviada para ${successCount} plataforma(s)!`, 'success');
    }, delay);
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