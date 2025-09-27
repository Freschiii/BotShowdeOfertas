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
let messageHistory = [];

// BotManager já está instanciado no bot.js

// Função de teste para debug
function testarWhatsApp() {
    console.log('🔧 TESTE: Iniciando teste do WhatsApp...');
    console.log('🔍 BotManager disponível:', typeof botManager !== 'undefined');
    console.log('🔍 Socket.IO disponível:', typeof io !== 'undefined');
    
    if (typeof botManager !== 'undefined') {
        console.log('🔄 Chamando botManager.connectWhatsApp()...');
        botManager.connectWhatsApp();
    } else {
        console.error('❌ BotManager não está disponível!');
        alert('Erro: BotManager não está disponível. Verifique o console.');
    }
}

// Event Listeners (com verificação de existência)
if (elements.connectWhatsApp) {
    elements.connectWhatsApp.addEventListener('click', connectWhatsApp);
}
if (elements.connectTelegram) {
    elements.connectTelegram.addEventListener('click', connectTelegram);
}
if (elements.saveGroups) {
    elements.saveGroups.addEventListener('click', saveGroups);
}

// Verificar se o botão de enviar existe antes de adicionar o listener
if (elements.sendMessage) {
elements.sendMessage.addEventListener('click', sendMessage);
    console.log('✅ Event listener do botão enviar adicionado');
    
    // Teste simples para verificar se o botão está funcionando
    elements.sendMessage.addEventListener('click', function() {
        console.log('🖱️ Botão enviar clicado!');
    });
} else {
    console.error('❌ Botão sendMessage não encontrado!');
}

// WhatsApp Input Events
document.addEventListener('DOMContentLoaded', function() {
    const messageTextInput = document.getElementById('messageTextInput');
    const whatsappAttachBtn = document.getElementById('whatsappAttachBtn');
    const whatsappImageInput = document.getElementById('whatsappImageInput');
    const whatsappAddBtn = document.getElementById('whatsappAddBtn');
    const whatsappDeleteBtn = document.getElementById('whatsappDeleteBtn');
    const whatsappScheduleBtn = document.getElementById('whatsappScheduleBtn');
    const whatsappScheduleArea = document.getElementById('whatsappScheduleArea');
    const whatsappScheduleConfirmBtn = document.getElementById('whatsappScheduleConfirmBtn');
    const whatsappScheduleCancelBtn = document.getElementById('whatsappScheduleCancelBtn');
    
    if (messageTextInput) {
        // Remover placeholder inicial
        messageTextInput.textContent = '';
        
        messageTextInput.addEventListener('input', function() {
            // Detectar e converter links automaticamente
            detectAndConvertLinks(this);
            // NÃO chamar updateWhatsAppPreview para não limpar o conteúdo
        });
        
        // Permitir Enter para quebra de linha
        messageTextInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                // Se Shift+Enter, permitir quebra de linha
                // Se Enter sozinho, adicionar mensagem à fila
                e.preventDefault();
                addMessageFromWhatsAppInput();
            }
        });
        
        // Interceptar colar para preservar espaços e processar imagens
        messageTextInput.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const clipboardData = e.clipboardData || window.clipboardData;
            
            // Verificar se há imagem no clipboard
            if (clipboardData.items) {
                for (let i = 0; i < clipboardData.items.length; i++) {
                    const item = clipboardData.items[i];
                    
                    if (item.type.indexOf('image') !== -1) {
                        console.log('📷 Imagem detectada no clipboard!');
                        
                        const file = item.getAsFile();
                        if (file) {
                            // Processar imagem colada
                            handlePastedImage(file, this);
                            return;
                        }
                    }
                }
            }
            
            // Se não há imagem, processar como texto
            const pastedText = clipboardData.getData('text/plain');
            
            // Inserir texto preservando espaços
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(pastedText));
                range.collapse(false);
            }
            
            // Forçar tamanho correto após colar
            setTimeout(() => {
                this.style.fontSize = '14px';
                this.style.lineHeight = '1.4';
                
                // Resetar todos os elementos filhos
                const allElements = this.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.fontSize = '14px';
                    el.style.lineHeight = '1.4';
                });
            }, 10);
        });
    }
    
    if (whatsappAttachBtn) {
        whatsappAttachBtn.addEventListener('click', function() {
            whatsappImageInput.click();
        });
    }
    
    if (whatsappImageInput) {
        whatsappImageInput.addEventListener('change', function(e) {
            handleWhatsAppImageUpload(e);
        });
    }
    
    if (whatsappAddBtn) {
        whatsappAddBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão adicionar clicado!');
            duplicateMessageBox();
        });
    } else {
        console.log('Botão whatsappAddBtn não encontrado!');
    }
    
    if (whatsappDeleteBtn) {
        whatsappDeleteBtn.addEventListener('click', function() {
            deleteCurrentMessage();
        });
    }
    
    if (whatsappScheduleBtn) {
        whatsappScheduleBtn.addEventListener('click', function() {
            toggleWhatsAppSchedule();
        });
    }
    
    if (whatsappScheduleConfirmBtn) {
        whatsappScheduleConfirmBtn.addEventListener('click', function() {
            confirmWhatsAppSchedule();
        });
    }
    
    if (whatsappScheduleCancelBtn) {
        whatsappScheduleCancelBtn.addEventListener('click', function() {
            cancelWhatsAppSchedule();
        });
    }

    const whatsappScheduleResetBtn = document.getElementById('whatsappScheduleResetBtn');
    if (whatsappScheduleResetBtn) {
        console.log('✅ Event listener do botão reset principal adicionado');
        whatsappScheduleResetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botão reset principal clicado!');
            resetWhatsAppSchedule();
        });
    } else {
        console.log('❌ Botão reset principal NÃO encontrado!');
    }
});

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

    // Modo escuro sempre ativo
    document.body.classList.add('dark-mode');

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
    
    // Inserir após a fila de mensagens (se existir)
    const messageQueue = document.getElementById('messageQueue');
    if (messageQueue && messageQueue.parentNode) {
    messageQueue.parentNode.insertBefore(newBtn, messageQueue.nextSibling);
    }
}

// Renderizar fila de mensagens
function renderMessageQueue() {
    const queueContainer = document.getElementById('messageQueue');
    if (!queueContainer) {
        console.log('Elemento messageQueue não encontrado, pulando renderização');
        return;
    }
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

// Detectar e converter links automaticamente
function detectAndConvertLinks(element) {
    const text = element.textContent;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    
    if (urls && urls.length > 0) {
        let html = text;
        
        // Converter URLs para links
        urls.forEach(url => {
            html = html.replace(url, `<a href="${url}" target="_blank" style="color: #25d366 !important; text-decoration: none !important; font-size: 14px !important;">${url}</a>`);
        });
        
        // Atualizar HTML se houver mudanças
        if (html !== element.innerHTML) {
            element.innerHTML = html;
            
            // Manter cursor no final
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(element);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
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
            
            let messageContent = `<div class="message-text">${item.text}</div>`;
            
            // Adicionar imagem se existir
            if (item.image) {
                messageContent = `
                    <div class="message-image">
                        <img src="${item.image}" alt="Imagem">
                    </div>
                    ${messageContent}
                `;
            }
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${messageContent}
                </div>
                <div class="message-time">${timeString}</div>
            `;
            
            previewContainer.appendChild(messageDiv);
        }
    });
    
    // Adicionar mensagem editável no final
    const editableMessage = document.getElementById('editableMessage');
    if (editableMessage) {
        previewContainer.appendChild(editableMessage);
    }
}

// Manipular upload de imagem do WhatsApp
function handleWhatsAppImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // Mostrar imagem na mensagem editável
        const editableMessage = document.getElementById('editableMessage');
        const messageContent = editableMessage.querySelector('.message-content');
        
        // Remover imagem anterior se existir
        const existingImage = messageContent.querySelector('.message-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        // Adicionar nova imagem
        const imageDiv = document.createElement('div');
        imageDiv.className = 'message-image';
        imageDiv.innerHTML = `<img src="${e.target.result}" alt="Imagem">`;
        
        // Inserir imagem antes do texto
        const messageText = messageContent.querySelector('.message-text');
        messageContent.insertBefore(imageDiv, messageText);
        
        // Salvar imagem para quando adicionar à fila
        window.currentImage = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Manipular upload de imagem para novas caixas do WhatsApp
function handleNewWhatsAppImageUpload(event, whatsappBox) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // Mostrar imagem na mensagem editável da nova caixa
        const editableMessage = whatsappBox.querySelector('.editable-message');
        const messageContent = editableMessage.querySelector('.message-content');
        
        // Remover imagem anterior se existir
        const existingImage = messageContent.querySelector('.message-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        // Adicionar nova imagem
        const imageDiv = document.createElement('div');
        imageDiv.className = 'message-image';
        imageDiv.innerHTML = `<img src="${e.target.result}" alt="Imagem">`;
        
        // Inserir imagem antes do texto
        const messageText = messageContent.querySelector('.message-text');
        messageContent.insertBefore(imageDiv, messageText);
        
        // Salvar imagem para quando adicionar à fila
        window.currentImage = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Duplicar caixa de mensagem
function duplicateMessageBox() {
    const whatsappPreview = document.getElementById('whatsappPreview');
    
    if (!whatsappPreview) {
        console.log('Elemento whatsappPreview não encontrado!');
        return;
    }
    
    // Criar nova caixa COMPLETA do WhatsApp
    const newWhatsAppBox = document.createElement('div');
    newWhatsAppBox.className = 'whatsapp-preview';
    newWhatsAppBox.id = `whatsappBox_${Date.now()}`;
    
    const uniqueId = Date.now();
    newWhatsAppBox.innerHTML = `
        <div class="whatsapp-chat">
            <div class="whatsapp-header">
                <div class="whatsapp-contact">
                    <div class="whatsapp-avatar"></div>
                    <div class="whatsapp-info">
                        <div class="whatsapp-name">Canal de Ofertas</div>
                        <div class="whatsapp-status">online</div>
                    </div>
                </div>
            </div>
            <div class="whatsapp-messages" id="whatsappPreview_${uniqueId}">
                <div class="whatsapp-message received editable-message" id="editableMessage_${uniqueId}">
                    <div class="message-content">
                        <div class="message-text" contenteditable="true" placeholder="Digite sua mensagem aqui..."></div>
                    </div>
                    <div class="message-time">Agora</div>
                </div>
            </div>
            <!-- Controles da Mensagem -->
            <div class="whatsapp-controls">
                <div class="whatsapp-controls-row">
                    <button class="whatsapp-control-btn" title="Adicionar Imagem">
                        <i class="fas fa-image"></i>
                    </button>
                    <input type="file" accept="image/*" style="display: none;" />
                    
                    <button class="whatsapp-control-btn" title="Agendar Mensagem">
                        <i class="fas fa-clock"></i>
                    </button>
                    
                    <button class="whatsapp-control-btn" title="Adicionar Mensagem">
                        <i class="fas fa-plus"></i>
                    </button>
                    
                    <button class="whatsapp-control-btn whatsapp-delete-btn" title="Deletar Mensagem" style="display: inline-block;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <!-- Área de Agendamento -->
                <div class="whatsapp-schedule-area" id="whatsappScheduleArea_${uniqueId}" style="display: none;">
                    <div class="schedule-container">
                    <div class="schedule-header">
                        <div class="schedule-title">
                            <i class="fas fa-clock"></i>
                            <span>Agendar Mensagem</span>
                        </div>
                        <button class="schedule-reset-icon" id="schedule-reset-${uniqueId}" title="Resetar Agendamento">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                        <div class="schedule-inputs">
                            <div class="date-input-group">
                                <label>Quando:</label>
                                <select class="schedule-date-select" id="schedule-date-${uniqueId}">
                                    <option value="today">Hoje</option>
                                    <option value="tomorrow">Amanhã</option>
                                </select>
                            </div>
                            <div class="time-input-group">
                                <label>Horário:</label>
                                <input type="time" class="schedule-time-input" id="schedule-time-${uniqueId}" />
                            </div>
                        </div>
                        <div class="schedule-actions">
                            <button class="schedule-confirm-btn" id="schedule-confirm-${uniqueId}">
                                <i class="fas fa-check"></i>
                                <span>Confirmar</span>
                            </button>
                            <button class="schedule-cancel-btn" id="schedule-cancel-${uniqueId}">
                                <i class="fas fa-times"></i>
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar nova caixa antes do botão de enviar
    const sendButtonContainer = document.querySelector('.send-button-container');
    if (sendButtonContainer) {
        sendButtonContainer.parentNode.insertBefore(newWhatsAppBox, sendButtonContainer);
    } else {
        const messageSender = document.querySelector('.message-sender');
        if (messageSender) {
            messageSender.appendChild(newWhatsAppBox);
        } else {
            whatsappPreview.parentNode.appendChild(newWhatsAppBox);
        }
    }
    
    // Configurar event listeners para a nova caixa
    setupNewWhatsAppBox(newWhatsAppBox);
    
    // Atualizar contador de mensagens
    updateMessageCounter();
    
    console.log('Nova caixa completa do WhatsApp criada!');
}

// Atualizar contador de mensagens
function updateMessageCounter() {
    const counter = document.getElementById('messageCounter');
    const allWhatsAppBoxes = document.querySelectorAll('.whatsapp-preview');
    const count = allWhatsAppBoxes.length;
    
    if (counter) {
        if (count > 1) {
            counter.style.display = 'block';
            counter.querySelector('.counter-text').textContent = `${count} mensagens`;
        } else {
            counter.style.display = 'none';
        }
    }
}

// Configurar event listeners para nova caixa completa do WhatsApp
function setupNewWhatsAppBox(whatsappBox) {
    const messageText = whatsappBox.querySelector('.message-text');
    const attachBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Adicionar Imagem"]');
    const imageInput = whatsappBox.querySelector('input[type="file"]');
    const scheduleBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Agendar Mensagem"]');
    const addBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Adicionar Mensagem"]');
    const deleteBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Deletar Mensagem"]');
    
    // Event listener para o texto
    if (messageText) {
        messageText.addEventListener('input', function() {
            detectAndConvertLinks(this);
            // NÃO chamar updateWhatsAppPreview para não limpar o conteúdo
        });
        
        messageText.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addMessageFromWhatsAppInput();
            }
        });
        
        messageText.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const clipboardData = e.clipboardData || window.clipboardData;
            
            // Verificar se há imagem no clipboard
            let hasImage = false;
            if (clipboardData.items) {
                for (let i = 0; i < clipboardData.items.length; i++) {
                    const item = clipboardData.items[i];
                    
                    if (item.type.indexOf('image') !== -1) {
                        console.log('📷 Imagem detectada no clipboard!');
                        
                        const file = item.getAsFile();
                        if (file) {
                            // Processar imagem colada
                            handlePastedImage(file, this);
                            hasImage = true;
                        }
                    }
                }
            }
            
            // Processar texto (mesmo se houver imagem)
            const pastedText = clipboardData.getData('text/plain');
            if (pastedText && pastedText.trim()) {
                console.log('📝 Texto detectado no clipboard:', pastedText);
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(pastedText));
                    range.collapse(false);
                }
            }
        });
    }
    
    // Event listener para anexar imagem
    if (attachBtn && imageInput) {
        attachBtn.addEventListener('click', function() {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', function(e) {
            handleNewWhatsAppImageUpload(e, whatsappBox);
        });
    }
    
    // Event listener para agendar
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', function() {
            toggleWhatsAppScheduleForBox(whatsappBox);
        });
    }
    
    // Event listeners diretos para confirmar e cancelar agendamento
    setTimeout(() => {
        const boxId = whatsappBox.id.replace('whatsappBox_', '');
        const scheduleConfirmBtn = document.getElementById(`schedule-confirm-${boxId}`);
        const scheduleCancelBtn = document.getElementById(`schedule-cancel-${boxId}`);
        
        
        if (scheduleConfirmBtn) {
            scheduleConfirmBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                confirmWhatsAppScheduleForBox(whatsappBox);
            };
        }
        
        if (scheduleCancelBtn) {
            scheduleCancelBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão cancelar clicado!');
                cancelWhatsAppScheduleForBox(whatsappBox);
            };
        } else {
            console.log('Botão cancelar NÃO encontrado!');
        }
        
        const scheduleResetBtn = document.getElementById(`schedule-reset-${boxId}`);
        if (scheduleResetBtn) {
            scheduleResetBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão reset clicado!');
                resetWhatsAppScheduleForBox(whatsappBox);
            };
        } else {
            console.log('Botão reset NÃO encontrado!');
        }
    }, 100);
    
    // Event listener para adicionar mensagem
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            duplicateMessageBox();
        });
    }
    
    // Event listener para deletar
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            whatsappBox.remove();
            updateMessageCounter();
        });
    }
}

// Configurar event listeners para nova caixa de mensagem
function setupNewMessageBox(messageBox) {
    const messageText = messageBox.querySelector('.message-text');
    
    // Event listener para o texto
    if (messageText) {
        messageText.addEventListener('input', function() {
            detectAndConvertLinks(this);
        });
        
        messageText.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addMessageFromWhatsAppInput();
            }
        });
        
        messageText.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const clipboardData = e.clipboardData || window.clipboardData;
            
            // Verificar se há imagem no clipboard
            let hasImage = false;
            if (clipboardData.items) {
                for (let i = 0; i < clipboardData.items.length; i++) {
                    const item = clipboardData.items[i];
                    
                    if (item.type.indexOf('image') !== -1) {
                        console.log('📷 Imagem detectada no clipboard!');
                        
                        const file = item.getAsFile();
                        if (file) {
                            // Processar imagem colada
                            handlePastedImage(file, this);
                            hasImage = true;
                        }
                    }
                }
            }
            
            // Processar texto (mesmo se houver imagem)
            const pastedText = clipboardData.getData('text/plain');
            if (pastedText && pastedText.trim()) {
                console.log('📝 Texto detectado no clipboard:', pastedText);
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(pastedText));
                    range.collapse(false);
                }
            }
        });
    }
}

// Processar imagem colada
function handlePastedImage(file, textInput) {
    console.log('📷 Processando imagem colada:', file.name, file.type, file.size);
    
    // Verificar se é uma imagem válida
    if (!file.type.startsWith('image/')) {
        console.log('❌ Arquivo não é uma imagem válida');
        return;
    }
    
    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        console.log('❌ Imagem muito grande (máximo 10MB)');
        botManager.showMessage('Imagem muito grande! Máximo 10MB.', 'error');
        return;
    }
    
    // Converter para base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        console.log('📷 Imagem convertida para base64');
        
        // Encontrar a caixa de mensagem correspondente
        const messageBox = textInput.closest('.whatsapp-message.received.editable-message');
        if (messageBox) {
            // Encontrar o message-content (mesmo local do upload por arquivo)
            const messageContent = messageBox.querySelector('.message-content');
            if (messageContent) {
                // Remover imagem anterior se existir
                const existingImage = messageContent.querySelector('.message-image');
                if (existingImage) {
                    existingImage.remove();
                }
                
                // Criar elemento de imagem (mesmo formato do upload por arquivo)
                const imageDiv = document.createElement('div');
                imageDiv.className = 'message-image';
                imageDiv.innerHTML = `<img src="${base64Data}" alt="Imagem colada">`;
                
                // Inserir imagem antes do texto (mesmo local do upload por arquivo)
                const messageText = messageContent.querySelector('.message-text');
                messageContent.insertBefore(imageDiv, messageText);
                
                // Salvar imagem para quando adicionar à fila (mesmo que upload por arquivo)
                window.currentImage = base64Data;
                
                // Mostrar mensagem de sucesso
                botManager.showMessage('Imagem colada com sucesso!', 'success');
                
                console.log('📷 Imagem colada adicionada no mesmo local do upload por arquivo');
            }
        }
    };
    
    reader.onerror = function() {
        console.log('❌ Erro ao ler imagem');
        botManager.showMessage('Erro ao processar imagem!', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Remover imagem
function removeImage(button) {
    const imageContainer = button.closest('.message-image');
    if (imageContainer) {
        imageContainer.remove();
        updateWhatsAppPreview();
        botManager.showMessage('Imagem removida!', 'success');
    }
}

// Adicionar mensagem do input do WhatsApp
function addMessageFromWhatsAppInput() {
    console.log('📝 addMessageFromWhatsAppInput chamada!');
    
    // Limpar fila anterior para evitar mensagens antigas
    messageQueue = [];
    console.log('🧹 Fila limpa para novas mensagens');
    
    // Coletar todas as mensagens das caixas
    const allMessageBoxes = document.querySelectorAll('.whatsapp-message.received.editable-message');
    console.log('📦 Caixas encontradas:', allMessageBoxes.length);
    let messagesAdded = 0;
    
    allMessageBoxes.forEach((messageBox, index) => {
        const messageText = messageBox.querySelector('.message-text');
        const messageImage = messageBox.querySelector('.message-image img');
        
        console.log(`📝 Caixa ${index + 1}:`, {
            text: messageText ? messageText.textContent : 'não encontrado',
            hasImage: !!messageImage
        });
        
        if (messageText && messageText.textContent.trim() && messageText.textContent.trim() !== 'Digite sua mensagem aqui...') {
            // Adicionar mensagem à fila diretamente
            messageCounter++;
            const messageId = `message_${messageCounter}`;
            
            const messageItem = {
                id: messageId,
                image: messageImage ? messageImage.src : null,
                text: messageText.textContent.trim(),
                schedule: null
            };
            
            console.log('✅ Adicionando mensagem à fila:', messageItem);
            messageQueue.push(messageItem);
            messagesAdded++;
        } else {
            console.log('❌ Mensagem vazia ou inválida na caixa', index + 1);
        }
    });
    
    if (messagesAdded === 0) {
        botManager.showMessage('Digite pelo menos uma mensagem primeiro!', 'error');
        return;
    }
    
    // Atualizar preview
    updateWhatsAppPreview();
    botManager.showMessage(`${messagesAdded} mensagem(ns) adicionada(s) à fila!`, 'success');
}

// Deletar mensagem atual
function deleteCurrentMessage() {
    if (messageQueue.length > 0) {
        messageQueue.pop();
        updateWhatsAppPreview();
        botManager.showMessage('Mensagem removida!', 'info');
    }
}

// Alternar agendamento do WhatsApp
function toggleWhatsAppSchedule() {
    const scheduleArea = document.getElementById('whatsappScheduleArea');
    const scheduleBtn = document.getElementById('whatsappScheduleBtn');
    
    if (scheduleArea.style.display === 'none') {
        scheduleArea.style.display = 'block';
        scheduleBtn.classList.add('active');
        
        // Definir data/hora mínima
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        const dateInput = document.getElementById('schedule-date-main');
        const timeInput = document.getElementById('schedule-time-main');
        
        if (dateInput) {
            dateInput.min = now.toISOString().slice(0, 10);
        }
        if (timeInput) {
            timeInput.min = now.toTimeString().slice(0, 5);
        }
    } else {
        scheduleArea.style.display = 'none';
        scheduleBtn.classList.remove('active');
    }
}

// Alternar agendamento para caixas específicas
function toggleWhatsAppScheduleForBox(whatsappBox) {
    const scheduleArea = whatsappBox.querySelector('.whatsapp-schedule-area');
    const scheduleBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Agendar Mensagem"]');
    
    if (scheduleArea && scheduleBtn) {
        if (scheduleArea.style.display === 'none' || scheduleArea.style.display === '') {
            scheduleArea.style.display = 'block';
            scheduleBtn.classList.add('active');
            
            // Definir data/hora mínima
            const now = new Date();
            now.setMinutes(now.getMinutes() + 1);
            const scheduleInput = scheduleArea.querySelector('input[type="datetime-local"]');
            if (scheduleInput) {
        scheduleInput.min = now.toISOString().slice(0, 16);
            }
    } else {
        scheduleArea.style.display = 'none';
        scheduleBtn.classList.remove('active');
        }
    }
}

// Confirmar agendamento
function confirmWhatsAppSchedule() {
    const dateSelect = document.getElementById('schedule-date-main');
    const timeInput = document.getElementById('schedule-time-main');
    
    if (!dateSelect || !timeInput) {
        console.log('Elementos de agendamento não encontrados na primeira caixa!');
        return;
    }
    
    const dateOption = dateSelect.value;
    const time = timeInput.value;
    
    if (!dateOption || !time) {
        botManager.showMessage('Selecione quando e que horas!', 'error');
        return;
    }
    
    // Converter opção para data real
    const now = new Date();
    let targetDate;
    
    if (dateOption === 'today') {
        targetDate = new Date(now);
    } else if (dateOption === 'tomorrow') {
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Combinar data e hora
    const scheduleTime = new Date(`${targetDate.toISOString().split('T')[0]}T${time}`);
    
    const selectedTime = new Date(scheduleTime);
    
    if (selectedTime <= now) {
        botManager.showMessage('A data/hora deve ser no futuro!', 'error');
        return;
    }
    
    // Adicionar mensagem agendada da primeira caixa apenas
    const messageTextInput = document.getElementById('messageTextInput');
    if (messageTextInput && messageTextInput.textContent.trim() && messageTextInput.textContent.trim() !== 'Digite sua mensagem aqui...') {
        // Buscar imagem na primeira caixa
        const firstMessageBox = document.querySelector('.whatsapp-message.received.editable-message');
        const messageImage = firstMessageBox ? firstMessageBox.querySelector('.message-image img') : null;
        
        console.log('🖼️ Imagem encontrada na primeira caixa:', {
            hasFirstMessageBox: !!firstMessageBox,
            hasImage: !!messageImage,
            imageSrc: messageImage ? messageImage.src : null
        });
        
        // Adicionar mensagem à fila diretamente
        messageCounter++;
        const messageId = `message_${messageCounter}`;
        
        const messageItem = {
            id: messageId,
            image: messageImage ? messageImage.src : null,
            text: messageTextInput.textContent.trim(),
            schedule: scheduleTime
        };
        
        messageQueue.push(messageItem);
        
        // NÃO atualizar preview para não limpar a imagem
        // updateWhatsAppPreview();
    }
    
    // Fechar área de agendamento
    document.getElementById('whatsappScheduleArea').style.display = 'none';
    const scheduleBtn = document.getElementById('whatsappScheduleBtn');
    scheduleBtn.classList.remove('active');
    
    // Mudar cor do ícone do relógio para indicar agendamento confirmado
    const clockIcon = scheduleBtn.querySelector('i');
    if (clockIcon) {
        clockIcon.style.color = '#25d366';
        clockIcon.style.textShadow = '0 0 8px rgba(37, 211, 102, 0.5)';
    }
    
    // Adicionar classe para indicar que está agendado
    scheduleBtn.classList.add('scheduled');
    
    // Forçar aplicação do CSS
    scheduleBtn.style.background = 'rgba(37, 211, 102, 0.2)';
    scheduleBtn.style.border = '1px solid #25d366';
    
    botManager.showMessage(`Mensagem agendada para ${selectedTime.toLocaleString('pt-BR')}`, 'success');
}

// Cancelar agendamento
function cancelWhatsAppSchedule() {
    document.getElementById('whatsappScheduleArea').style.display = 'none';
    document.getElementById('whatsappScheduleBtn').classList.remove('active');
}

// Resetar agendamento
function resetWhatsAppSchedule() {
    console.log('🔄 Resetando agendamento da primeira caixa...');
    
    // Fechar área de agendamento
    const scheduleArea = document.getElementById('whatsappScheduleArea');
    console.log('📍 Área de agendamento encontrada:', !!scheduleArea);
    if (scheduleArea) {
        scheduleArea.style.display = 'none';
        console.log('✅ Área de agendamento fechada');
    }
    
    // Resetar botão de agendamento
    const scheduleBtn = document.getElementById('whatsappScheduleBtn');
    console.log('📍 Botão de agendamento encontrado:', !!scheduleBtn);
    if (scheduleBtn) {
        scheduleBtn.classList.remove('active', 'scheduled');
        scheduleBtn.style.background = '';
        scheduleBtn.style.border = '';
        console.log('✅ Classes removidas do botão');
        
        // Resetar ícone do relógio
        const clockIcon = scheduleBtn.querySelector('i');
        if (clockIcon) {
            clockIcon.style.color = '';
            clockIcon.style.textShadow = '';
            console.log('✅ Ícone resetado');
        }
    }
    
    // Resetar campos de agendamento
    const dateSelect = document.getElementById('schedule-date-main');
    const timeInput = document.getElementById('schedule-time-main');
    
    console.log('📍 Campos encontrados:', {
        dateSelect: !!dateSelect,
        timeInput: !!timeInput
    });
    
    if (dateSelect) {
        dateSelect.value = 'today';
        console.log('✅ Data resetada para "today"');
    }
    if (timeInput) {
        timeInput.value = '';
        console.log('✅ Hora resetada');
    }
    
    // Remover atributos de agendamento
    const whatsappPreview = document.getElementById('whatsappPreview');
    if (whatsappPreview) {
        whatsappPreview.removeAttribute('data-scheduled');
        whatsappPreview.removeAttribute('data-schedule-time');
    }
    
    // Limpar mensagens agendadas da fila
    messageQueue = messageQueue.filter(item => !item.schedule);
    console.log('🧹 Mensagens agendadas removidas da fila');
    
    botManager.showMessage('🔄 Agendamento resetado!', 'info');
    console.log('✅ Agendamento da primeira caixa resetado');
}

// Confirmar agendamento para caixas específicas
function confirmWhatsAppScheduleForBox(whatsappBox) {
    // Encontrar o ID único da caixa
    const boxId = whatsappBox.id.replace('whatsappBox_', '');
    
    const dateSelect = document.getElementById(`schedule-date-${boxId}`);
    const timeInput = document.getElementById(`schedule-time-${boxId}`);
    
    if (!dateSelect || !timeInput) {
        botManager.showMessage('Erro: Elementos de agendamento não encontrados!', 'error');
        return;
    }
    
    const dateOption = dateSelect.value;
    const time = timeInput.value;
    
    if (!dateOption || !time) {
        botManager.showMessage('Selecione quando e que horas!', 'error');
        return;
    }
    
    // Converter opção para data real
    const now = new Date();
    let targetDate;
    
    if (dateOption === 'today') {
        targetDate = new Date(now);
    } else if (dateOption === 'tomorrow') {
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Combinar data e hora
    const scheduleTime = new Date(`${targetDate.toISOString().split('T')[0]}T${time}`);
    
    if (scheduleTime <= now) {
        botManager.showMessage('A data/hora deve ser no futuro!', 'error');
        return;
    }
    
    // Adicionar mensagem agendada da caixa específica apenas
    const messageText = whatsappBox.querySelector('.message-text');
    const messageImage = whatsappBox.querySelector('.message-image img');
    
    console.log('🖼️ Imagem encontrada na caixa específica:', {
        hasMessageText: !!messageText,
        hasImage: !!messageImage,
        imageSrc: messageImage ? messageImage.src : null,
        boxId: whatsappBox.id
    });
    
    if (messageText && messageText.textContent.trim() && messageText.textContent.trim() !== 'Digite sua mensagem aqui...') {
        // Adicionar mensagem à fila diretamente
        messageCounter++;
        const messageId = `message_${messageCounter}`;
        
        const messageItem = {
            id: messageId,
            image: messageImage ? messageImage.src : null,
            text: messageText.textContent.trim(),
            schedule: scheduleTime.toISOString()
        };
        
        messageQueue.push(messageItem);
        
        // NÃO atualizar preview para não limpar a imagem
        // updateWhatsAppPreview();
    }
    
    // Fechar área de agendamento
    const scheduleArea = whatsappBox.querySelector('.whatsapp-schedule-area');
    if (scheduleArea) {
        scheduleArea.style.display = 'none';
    }
    const scheduleBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Agendar Mensagem"]');
    scheduleBtn.classList.remove('active');
    
    // Mudar cor do ícone do relógio para indicar agendamento confirmado
    const clockIcon = scheduleBtn.querySelector('i');
    if (clockIcon) {
        clockIcon.style.color = '#25d366';
        clockIcon.style.textShadow = '0 0 8px rgba(37, 211, 102, 0.5)';
    }
    
    // Adicionar classe para indicar que está agendado
    scheduleBtn.classList.add('scheduled');
    
    // Forçar aplicação do CSS
    scheduleBtn.style.background = 'rgba(37, 211, 102, 0.2)';
    scheduleBtn.style.border = '1px solid #25d366';
    
    // Salvar dados do agendamento na caixa
    whatsappBox.setAttribute('data-scheduled', 'true');
    whatsappBox.setAttribute('data-schedule-time', scheduleTime.toISOString());
    
    botManager.showMessage(`Mensagem agendada para ${scheduleTime.toLocaleString('pt-BR')}`, 'success');
}

// Cancelar agendamento para caixas específicas
function cancelWhatsAppScheduleForBox(whatsappBox) {
    const scheduleArea = whatsappBox.querySelector('.whatsapp-schedule-area');
    const scheduleBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Agendar Mensagem"]');
    
    scheduleArea.style.display = 'none';
    scheduleBtn.classList.remove('active');
}

// Resetar agendamento para caixas específicas
function resetWhatsAppScheduleForBox(whatsappBox) {
    console.log('🔄 Resetando agendamento da caixa:', whatsappBox.id);
    
    // Fechar área de agendamento
    const scheduleArea = whatsappBox.querySelector('.whatsapp-schedule-area');
    if (scheduleArea) {
        scheduleArea.style.display = 'none';
    }
    
    // Resetar botão de agendamento
    const scheduleBtn = whatsappBox.querySelector('.whatsapp-control-btn[title="Agendar Mensagem"]');
    if (scheduleBtn) {
        scheduleBtn.classList.remove('active', 'scheduled');
        scheduleBtn.style.background = '';
        scheduleBtn.style.border = '';
        
        // Resetar ícone do relógio
        const clockIcon = scheduleBtn.querySelector('i');
        if (clockIcon) {
            clockIcon.style.color = '';
            clockIcon.style.textShadow = '';
        }
    }
    
    // Resetar campos de agendamento
    const boxId = whatsappBox.id.replace('whatsappBox_', '');
    const dateSelect = document.getElementById(`schedule-date-${boxId}`);
    const timeInput = document.getElementById(`schedule-time-${boxId}`);
    
    if (dateSelect) {
        dateSelect.value = 'today';
    }
    if (timeInput) {
        timeInput.value = '';
    }
    
    // Remover atributos de agendamento
    whatsappBox.removeAttribute('data-scheduled');
    whatsappBox.removeAttribute('data-schedule-time');
    
    // Limpar mensagens agendadas da fila
    messageQueue = messageQueue.filter(item => !item.schedule);
    console.log('🧹 Mensagens agendadas removidas da fila');
    
    botManager.showMessage('🔄 Agendamento resetado!', 'info');
    console.log('✅ Agendamento da caixa', whatsappBox.id, 'resetado');
}

// Conectar WhatsApp
async function connectWhatsApp() {
    try {
        console.log('🔄 Iniciando conexão WhatsApp...');
        
        // Conectar WhatsApp real
        await botManager.connectWhatsApp();
        console.log('✅ WhatsApp conectado automaticamente!');
        
    } catch (error) {
        console.log('❌ Erro ao conectar WhatsApp automaticamente:', error.message);
        throw error; // Re-throw para que a função autoConnectBots possa capturar
    }
}

// Conectar Telegram
async function connectTelegram() {
    // Tentar usar token salvo automaticamente
    let token = elements.telegramToken.value.trim();
    
    // Se não há token no campo, tentar carregar do localStorage
    if (!token) {
        const savedToken = localStorage.getItem('telegramToken');
        if (savedToken) {
            token = savedToken;
            elements.telegramToken.value = token;
            console.log('📱 Token do Telegram carregado automaticamente do localStorage');
        }
    }
    
    if (!token) {
        console.log('⚠️ Nenhum token do Telegram encontrado para conexão automática');
        return;
    }
    
    try {
        elements.connectTelegram.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        elements.connectTelegram.disabled = true;
        
        await botManager.connectTelegram(token);
        
        elements.connectTelegram.innerHTML = '<i class="fas fa-check"></i> Conectado';
        elements.connectTelegram.disabled = false;
        console.log('✅ Telegram conectado automaticamente!');
    } catch (error) {
        elements.connectTelegram.innerHTML = '<i class="fas fa-link"></i> Conectar';
        elements.connectTelegram.disabled = false;
        console.log('❌ Erro ao conectar Telegram automaticamente:', error.message);
        throw error; // Re-throw para que a função autoConnectBots possa capturar
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
    console.log('🚀 Função sendMessage chamada!');
    console.log('📊 Estado atual:', {
        messageQueue: messageQueue.length,
        whatsappConnected: botManager.isConnected.whatsapp,
        telegramConnected: botManager.isConnected.telegram,
        whatsappGroup: botManager.whatsappGroup,
        telegramGroup: botManager.telegramGroup
    });
    
    // Verificar se pelo menos um bot está conectado
    const sendToWhatsApp = elements.sendToWhatsApp.checked;
    const sendToTelegram = elements.sendToTelegram.checked;
    
    console.log('📱 Plataformas selecionadas:', { sendToWhatsApp, sendToTelegram });
    
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
    
    // Verificar se os grupos estão configurados
    if (sendToWhatsApp && !botManager.whatsappGroup) {
        botManager.showMessage('Configure o grupo do WhatsApp primeiro!', 'error');
        return;
    }
    
    if (sendToTelegram && !botManager.telegramGroup) {
        botManager.showMessage('Configure o grupo do Telegram primeiro!', 'error');
        return;
    }

    // Verificar se há mensagens na fila
    console.log('📋 Fila de mensagens:', messageQueue);
    // Limpar mensagens vazias da fila
    messageQueue = messageQueue.filter(item => item.text && item.text.trim());
    console.log('🧹 Fila limpa, mensagens válidas:', messageQueue.length);
    
    if (messageQueue.length === 0) {
        // Tentar coletar mensagens das caixas do WhatsApp primeiro
        console.log('⚠️ Nenhuma mensagem na fila, tentando coletar das caixas...');
        addMessageFromWhatsAppInput();
        
        // Se ainda não houver mensagens, mostrar erro
        if (messageQueue.length === 0) {
            botManager.showMessage('Digite uma mensagem nas caixas do WhatsApp primeiro!', 'error');
        return;
        }
    }

    // Verificar se todas as mensagens têm texto
    const emptyMessages = messageQueue.filter(item => !item.text.trim());
    if (emptyMessages.length > 0) {
        console.log('❌ Mensagens vazias encontradas:', emptyMessages);
        botManager.showMessage('Todas as mensagens devem ter texto!', 'error');
        return;
    }

    try {
        console.log('🔄 Iniciando envio das mensagens...');
        elements.sendMessage.classList.add('loading');
        elements.sendMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Processando...</span>';
        elements.sendMessage.disabled = true;
        
        // Processar fila de mensagens
        console.log('📤 Chamando processMessageQueue...');
        await processMessageQueue(sendToWhatsApp, sendToTelegram);
        console.log('✅ processMessageQueue concluído!');
        
        // Limpar fila após envio bem-sucedido
        messageQueue = [];
        console.log('🧹 Fila limpa após envio');
        
    } catch (error) {
        botManager.showMessage('Erro ao enviar mensagens: ' + error.message, 'error');
    } finally {
        elements.sendMessage.classList.remove('loading');
        elements.sendMessage.innerHTML = '<i class="fas fa-paper-plane"></i> <span class="btn-text">Enviar Mensagens</span>';
        elements.sendMessage.disabled = false;
    }
}

// Processar fila de mensagens
async function processMessageQueue(sendToWhatsApp, sendToTelegram) {
    console.log('🔄 processMessageQueue iniciado com:', { sendToWhatsApp, sendToTelegram });
    const platforms = {
        whatsapp: sendToWhatsApp,
        telegram: sendToTelegram
    };
    console.log('🌐 Plataformas configuradas:', platforms);
    
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
    
    // Limpar caixas após envio para evitar duplicatas
    console.log('🧹 Chamando clearAllMessageBoxes após envio...');
    clearAllMessageBoxes();
    console.log('✅ clearAllMessageBoxes concluído');
}

// Enviar mensagem imediata
async function sendImmediateMessage(messageItem, platforms) {
    console.log('📤 sendImmediateMessage chamada com:', { messageItem, platforms });
    const results = await botManager.sendMessage(messageItem.text, messageItem.image, platforms);
    console.log('📤 Resultados do envio:', results);
    
    // Adicionar ao histórico
    addToHistory(messageItem, platforms, results, false);
    
    const successCount = results.filter(r => r.success).length;
    botManager.showMessage(`Mensagem "${messageItem.text.substring(0, 30)}..." enviada para ${successCount} plataforma(s)`, 'info');
}

// Adicionar mensagem ao histórico
function addToHistory(messageItem, platforms, results, isScheduled = false) {
    const historyItem = {
        id: `history_${Date.now()}`,
        message: messageItem.text,
        image: messageItem.image,
        platforms: platforms,
        results: results,
        isScheduled: isScheduled,
        timestamp: new Date().toISOString(),
        scheduledFor: isScheduled ? messageItem.schedule : null
    };
    
    messageHistory.unshift(historyItem); // Adicionar no início
    console.log('📝 Adicionado ao histórico:', historyItem);
    
    // Manter apenas os últimos 50 itens
    if (messageHistory.length > 50) {
        messageHistory = messageHistory.slice(0, 50);
    }
    
    // Atualizar interface do histórico
    updateHistoryDisplay();
}

// Atualizar exibição do histórico
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('messageHistory');
    if (!historyContainer) return;
    
    if (messageHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">Nenhuma mensagem enviada ainda</p>';
        return;
    }
    
    let historyHTML = '';
    messageHistory.forEach((item, index) => {
        const date = new Date(item.timestamp);
        const scheduledDate = item.scheduledFor ? new Date(item.scheduledFor) : null;
        
        const platformsText = Object.keys(item.platforms)
            .filter(platform => item.platforms[platform])
            .map(platform => platform === 'whatsapp' ? 'WhatsApp' : 'Telegram')
            .join(', ');
        
        const successCount = item.results.filter(r => r.success).length;
        const totalCount = item.results.length;
        
        historyHTML += `
            <div class="history-item ${item.isScheduled ? 'scheduled' : 'sent'}">
                <div class="history-header">
                    <div class="history-info">
                        <span class="history-type">
                            <i class="fas ${item.isScheduled ? 'fa-clock' : 'fa-paper-plane'}"></i>
                            ${item.isScheduled ? 
                                (item.delivered ? '<span style="text-decoration: line-through; opacity: 0.6;">Agendada</span> → Enviada' : 'Agendada') : 
                                'Enviada'
                            }
                        </span>
                        <span class="history-platforms">${platformsText}</span>
                        <span class="history-time">${date.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="history-status ${successCount === totalCount ? 'success' : 'partial'}">
                        <i class="fas ${successCount === totalCount ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                        ${successCount}/${totalCount} redes
                    </div>
                </div>
                <div class="history-content">
                    <div class="history-message">
                        ${item.image ? '<div class="history-image"><img src="' + item.image + '" alt="Imagem"></div>' : ''}
                        <div class="history-text">${item.message.substring(0, 80)}${item.message.length > 80 ? '...' : ''}</div>
                    </div>
                    ${scheduledDate ? `<div class="history-scheduled">Agendada para: ${scheduledDate.toLocaleString('pt-BR')}</div>` : ''}
                    <div class="history-results">
                        ${item.results.map(result => `
                            <span class="result-item ${result.success ? 'success' : 'error'}">
                                <i class="fas ${result.success ? 'fa-check' : 'fa-times'}"></i>
                                ${result.platform}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHTML;
}

// Limpar todas as caixas de mensagem após envio
// RESET SIMPLIFICADO - APENAS LIMPAR CAIXA DE TEXTO
function clearAllMessageBoxes() {
    console.log('🧹 Reset simplificado - apenas limpar caixa de texto');
    
    // 1. Limpar fila de mensagens
    messageQueue = [];
    
    // 2. Limpar TODOS os inputs de texto (mais robusto)
    const allTextInputs = document.querySelectorAll('#messageTextInput, .message-text, [contenteditable="true"]');
    allTextInputs.forEach(input => {
        input.textContent = '';
        input.innerHTML = '';
        input.value = '';
        console.log('✅ Input limpo:', input.id || input.className);
    });
    
    // 3. Limpar input principal específico
    const mainInput = document.getElementById('messageTextInput');
    if (mainInput) {
        mainInput.textContent = '';
        mainInput.innerHTML = '';
        mainInput.value = '';
        console.log('✅ Input principal limpo');
    }
    
    // 4. Remover todas as caixas duplicadas
    const allWhatsAppBoxes = document.querySelectorAll('.whatsapp-preview');
    allWhatsAppBoxes.forEach((box, index) => {
        if (index > 0) { // Manter apenas a primeira (index 0)
            box.remove();
            console.log(`✅ Caixa duplicada ${index + 1} removida`);
        }
    });
    
    // 5. Limpar qualquer texto que possa estar nas caixas
    const allMessageBoxes = document.querySelectorAll('.whatsapp-message');
    allMessageBoxes.forEach(box => {
        const textElements = box.querySelectorAll('.message-text');
        textElements.forEach(text => {
            text.textContent = '';
            text.innerHTML = '';
        });
    });
    
    // 6. Atualizar contador
    updateMessageCounter();
    
    // 7. Mostrar notificação
    botManager.showMessage('🧹 Caixas limpas! Pronto para novas mensagens.', 'info');
    
    console.log('✅ Reset simplificado concluído!');
}

// Agendar mensagem da fila
async function scheduleQueueMessage(messageItem, platforms) {
    const scheduleTime = new Date(messageItem.schedule).getTime();
    const now = new Date().getTime();
    
    if (scheduleTime <= now) {
        botManager.showMessage('A data/hora deve ser no futuro!', 'error');
        return;
    }
    
    // Adicionar ao histórico como agendada
    addToHistory(messageItem, platforms, [
        { platform: 'WhatsApp', success: true, message: 'Agendada' },
        { platform: 'Telegram', success: true, message: 'Agendada' }
    ], true);
    
    const delay = scheduleTime - now;
    
    botManager.showMessage(`Mensagem agendada para ${new Date(scheduleTime).toLocaleString('pt-BR')}`, 'info');
    
    // Agendar envio
    setTimeout(async () => {
        botManager.showMessage('Enviando mensagem agendada...', 'info');
        
        console.log('📤 Enviando mensagem agendada com:', {
            text: messageItem.text,
            hasImage: !!messageItem.image,
            imageSrc: messageItem.image,
            platforms: platforms
        });
        
        const results = await botManager.sendMessage(messageItem.text, messageItem.image, platforms);
        
        // Atualizar histórico com resultado real
        const historyIndex = messageHistory.findIndex(item => 
            item.message === messageItem.text && 
            item.isScheduled && 
            item.scheduledFor === messageItem.schedule
        );
        
        if (historyIndex !== -1) {
            messageHistory[historyIndex].results = results;
            messageHistory[historyIndex].isScheduled = false;
            messageHistory[historyIndex].timestamp = new Date().toISOString();
            messageHistory[historyIndex].delivered = true; // Marcar como entregue
            updateHistoryDisplay();
        }
        
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
    
    // Focar no campo de mensagem e definir placeholder
    const messageInput = document.getElementById('messageTextInput');
    if (messageInput) {
        messageInput.focus();
    
    // Adicionar placeholder dinâmico
    const placeholders = [
        '🔥 OFERTA IMPERDÍVEL! 🔥\n\nProduto incrível com preço especial!\n💰 Apenas R$ 99,90!\n\n⚡ Corre que é por tempo limitado!',
        '🚨 PROMOÇÃO RELÂMPAGO! 🚨\n\nProduto com desconto especial!\n🎯 Não perca essa oportunidade!\n\n🛒 Compre agora!',
        '💥 SUPER OFERTA! 💥\n\nProduto com preço imperdível!\n🎁 Aproveite essa chance única!\n\n🔥 Últimas unidades!'
    ];
    
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
        messageInput.placeholder = randomPlaceholder;
    }
    
    // Inicializar interface de descoberta
    initializeDiscoveryInterface();
    
    // Adicionar salvamento automático dos campos
    setupAutoSave();
    
    // Conectar automaticamente WhatsApp e Telegram
    autoConnectBots();
    
    // Adicionar botão de reconexão WhatsApp
    const reconnectBtn = document.createElement('button');
    reconnectBtn.innerHTML = '🔄 Reconectar WhatsApp';
    reconnectBtn.style.cssText = `
        background: #25d366;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        margin: 10px;
        font-weight: 600;
    `;
    reconnectBtn.onclick = () => {
        console.log('🔄 Reconectando WhatsApp...');
        console.log('🔍 BotManager disponível:', !!botManager);
        console.log('🔍 Método connectWhatsApp disponível:', typeof botManager.connectWhatsApp);
        
        if (botManager && typeof botManager.connectWhatsApp === 'function') {
            botManager.connectWhatsApp();
        } else {
            console.error('❌ BotManager ou método connectWhatsApp não disponível');
            alert('Erro: BotManager não está disponível. Recarregue a página.');
        }
    };
    
    // Adicionar botão ao header
    const header = document.querySelector('.whatsapp-header');
    if (header) {
        header.appendChild(reconnectBtn);
    }
});

// Conectar automaticamente os bots
async function autoConnectBots() {
    console.log('🔄 Iniciando conexão automática dos bots...');
    
    // Mostrar notificação para o usuário
    botManager.showMessage('🔄 Conectando automaticamente WhatsApp e Telegram...', 'info');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(async () => {
        let whatsappConnected = false;
        let telegramConnected = false;
        
        try {
            // 1. Tentar conectar WhatsApp automaticamente
            console.log('📱 Tentando conectar WhatsApp automaticamente...');
            await connectWhatsApp();
            whatsappConnected = true;
            botManager.showMessage('✅ WhatsApp conectado automaticamente!', 'success');
            
        } catch (error) {
            console.log('⚠️ WhatsApp não conectou automaticamente:', error.message);
            botManager.showMessage('⚠️ WhatsApp não conectou automaticamente', 'warning');
        }
        
        // Aguardar um pouco antes de conectar Telegram
        setTimeout(async () => {
            try {
                // 2. Tentar conectar Telegram automaticamente
                console.log('📱 Tentando conectar Telegram automaticamente...');
                await connectTelegram();
                telegramConnected = true;
                botManager.showMessage('✅ Telegram conectado automaticamente!', 'success');
                
            } catch (error) {
                console.log('⚠️ Telegram não conectou automaticamente:', error.message);
                botManager.showMessage('⚠️ Telegram não conectou automaticamente', 'warning');
            }
            
            // Resumo final
            if (whatsappConnected && telegramConnected) {
                botManager.showMessage('🎉 Ambos os bots conectados automaticamente!', 'success');
            } else if (whatsappConnected || telegramConnected) {
                botManager.showMessage('✅ Pelo menos um bot conectado automaticamente!', 'success');
            } else {
                botManager.showMessage('⚠️ Nenhum bot conectou automaticamente. Tente conectar manualmente.', 'warning');
            }
            
        }, 2000); // Aguardar 2 segundos entre as conexões
        
    }, 1000); // Aguardar 1 segundo antes de começar
}

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