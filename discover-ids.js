// Descobrir IDs dos Canais - WhatsApp e Telegram
class GroupIDDiscoverer {
    constructor() {
        this.whatsappGroups = [];
        this.telegramGroups = [];
    }

    // Descobrir canais do WhatsApp
    async discoverWhatsAppChannels() {
        try {
            // Verificar se estamos no WhatsApp Web
            if (!window.location.href.includes('web.whatsapp.com')) {
                throw new Error('Acesse o WhatsApp Web primeiro');
            }

            // Mostrar instruções para o usuário
            const instructions = `
            <div class="discovery-help">
                <h3>🔍 Como Descobrir ID do Canal WhatsApp:</h3>
                <ol>
                    <li><strong>Abra o Console do Navegador</strong> (pressione F12)</li>
                    <li><strong>Cole este código no console:</strong></li>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
// Descobrir ID do canal atual
const chat = window.Store.Chat.models.find(c => c.isChannel || c.isBroadcast);
if (chat) {
    console.log('ID do Canal:', chat.id._serialized);
    console.log('Nome do Canal:', chat.name);
} else {
    console.log('Nenhum canal encontrado. Certifique-se de estar em um canal.');
}
                    </pre>
                    <li><strong>Copie o ID</strong> que aparecer no console</li>
                    <li><strong>Cole o ID</strong> no campo "ID do Canal WhatsApp"</li>
                </ol>
                <p style="color: #666; font-size: 0.9rem;">
                    💡 <strong>Dica:</strong> Certifique-se de estar visualizando o canal no WhatsApp Web antes de executar o código.
                </p>
            </div>
            `;

            return {
                channels: [],
                instructions: instructions
            };

        } catch (error) {
            console.error('Erro ao descobrir canais WhatsApp:', error);
            throw error;
        }
    }

    // Descobrir canais do Telegram
    async discoverTelegramChannels(token) {
        try {
            if (!token) {
                throw new Error('Token do Telegram é obrigatório');
            }

            const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.description || 'Erro na API do Telegram');
            }
            
            const channels = [];
            data.result.forEach(update => {
                if (update.message && update.message.chat) {
                    const chat = update.message.chat;
                    // Filtrar canais (não grupos)
                    if (chat.type === 'channel' || 
                        chat.type === 'supergroup' || 
                        (chat.type === 'group' && chat.title && chat.title.includes('Canal'))) {
                        
                        const channel = {
                            id: chat.id,
                            title: chat.title || 'Canal sem nome',
                            type: chat.type === 'channel' ? 'Canal' : 'Supergrupo',
                            username: chat.username || null
                        };
                        
                        // Evitar duplicatas
                        if (!channels.find(c => c.id === channel.id)) {
                            channels.push(channel);
                        }
                    }
                }
            });

            return channels;
        } catch (error) {
            console.error('Erro ao descobrir canais Telegram:', error);
            return [];
        }
    }

    // Interface para descobrir IDs
    createDiscoveryInterface() {
        const interfaceHTML = `
            <div class="discovery-interface">
                <h3>🔍 Descobrir IDs dos Canais</h3>
                
                <div class="discovery-section">
                    <h4>📱 WhatsApp</h4>
                    <button id="discoverWhatsApp" class="btn-whatsapp">
                        <i class="fas fa-search"></i> Mostrar Instruções WhatsApp
                    </button>
                    <div id="whatsappGroups" class="groups-list"></div>
                </div>

                <div class="discovery-section">
                    <h4>📱 Telegram</h4>
                    <input type="text" id="telegramTokenInput" placeholder="Token do Bot Telegram" />
                    <button id="discoverTelegram" class="btn-telegram">
                        <i class="fas fa-search"></i> Descobrir Canais Telegram
                    </button>
                    <div id="telegramGroups" class="groups-list"></div>
                </div>

                <div class="discovery-help">
                    <h4>💡 Como Funciona</h4>
                    <p><strong>WhatsApp:</strong> Clique em "Mostrar Instruções" para ver como descobrir o ID</p>
                    <p><strong>Telegram:</strong> Digite o token do seu bot e clique em "Descobrir Canais"</p>
                    <p><strong>Importante:</strong> Certifique-se de que o bot está nos canais que você quer usar</p>
                </div>
            </div>
        `;

        return interfaceHTML;
    }

    // Mostrar grupos descobertos
    displayGroups(groups, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (groups.length === 0) {
            container.innerHTML = '<p class="no-groups">Nenhum canal encontrado</p>';
            return;
        }

        const groupsHTML = groups.map(group => `
            <div class="group-item">
                <div class="group-info">
                    <h5>${group.name || group.title}</h5>
                    <p><strong>ID:</strong> <code>${group.id}</code></p>
                    ${group.participants ? `<p><strong>Participantes:</strong> ${group.participants}</p>` : ''}
                </div>
                <button class="btn-copy" onclick="copyToClipboard('${group.id}')">
                    <i class="fas fa-copy"></i> Copiar ID
                </button>
            </div>
        `).join('');

        container.innerHTML = groupsHTML;
    }

    // Mostrar instruções do WhatsApp
    displayWhatsAppInstructions() {
        const container = document.getElementById('whatsappGroups');
        if (!container) return;

        const instructionsHTML = `
            <div class="discovery-help">
                <h4>🔍 Como Descobrir ID do Canal WhatsApp:</h4>
                <ol>
                    <li><strong>Abra o WhatsApp Web</strong> no seu navegador</li>
                    <li><strong>Acesse o canal</strong> que você quer usar</li>
                    <li><strong>Abra o Console do Navegador</strong> (pressione F12)</li>
                    <li><strong>Cole este código no console:</strong></li>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
// Descobrir ID do canal atual
const chat = window.Store.Chat.models.find(c => c.isChannel || c.isBroadcast);
if (chat) {
    console.log('ID do Canal:', chat.id._serialized);
    console.log('Nome do Canal:', chat.name);
} else {
    console.log('Nenhum canal encontrado. Certifique-se de estar em um canal.');
}
                    </pre>
                    <li><strong>Copie o ID</strong> que aparecer no console</li>
                    <li><strong>Cole o ID</strong> no campo "ID do Canal WhatsApp"</li>
                </ol>
                <p style="color: #666; font-size: 0.9rem;">
                    💡 <strong>Dica:</strong> Certifique-se de estar visualizando o canal no WhatsApp Web antes de executar o código.
                </p>
            </div>
        `;

        container.innerHTML = instructionsHTML;
    }

    // Copiar ID para área de transferência
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showMessage('ID copiado para a área de transferência!', 'success');
        }).catch(() => {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('ID copiado para a área de transferência!', 'success');
        });
    }

    // Mostrar mensagem
    showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.discovery-message');
        existingMessages.forEach(msg => msg.remove());

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `discovery-message ${type}`;
        messageDiv.textContent = message;

        // Adicionar após o header
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(messageDiv);
        } else {
            document.body.appendChild(messageDiv);
        }

        // Remover após 3 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Instância global
const groupDiscoverer = new GroupIDDiscoverer();

// Função global para copiar
window.copyToClipboard = (text) => groupDiscoverer.copyToClipboard(text);