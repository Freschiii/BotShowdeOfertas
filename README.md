# 🤖 Bot Show de Ofertas

Sistema completo para envio automático de mensagens com imagens para WhatsApp e Telegram.

## 🚀 Funcionalidades

- ✅ **WhatsApp:** Conexão real via QR Code + envio de imagens
- ✅ **Telegram:** Bot API + envio de imagens  
- ✅ **Salvamento Automático:** Dados persistem entre sessões
- ✅ **Interface Moderna:** Design responsivo e intuitivo
- ✅ **Logs Detalhados:** Debug completo

## 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/Freschiii/BotShowdeOfertas.git
cd BotShowdeOfertas

# Instalar dependências
npm install

# Executar o projeto
npm start
```

## 🎯 Como Usar

1. **Acesse:** http://localhost:3000
2. **Conecte WhatsApp:** Escaneie o QR Code
3. **Configure Telegram:** Digite o token do bot
4. **Descubra IDs:** Use as instruções na interface
5. **Envie mensagens:** Selecione imagem + digite mensagem

## 🔧 Configuração

### **WhatsApp:**
- Conecta via QR Code real
- Dados salvos automaticamente
- Suporte a imagens

### **Telegram:**
- Token do bot obrigatório
- ID do canal obrigatório
- Suporte a imagens

## 📱 Descoberta de IDs

### **WhatsApp:**
1. Abra o WhatsApp Web
2. Acesse o canal desejado
3. Abra o Console (F12)
4. Cole o código fornecido na interface
5. Copie o ID que aparecer

### **Telegram:**
1. Adicione o bot ao canal
2. Digite o token do bot
3. Clique em "Descobrir Canais"
4. Copie o ID do canal

## 🛠️ Tecnologias

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **WhatsApp:** whatsapp-web.js
- **Telegram:** Bot API
- **Comunicação:** Socket.IO
- **Salvamento:** LocalStorage

## 📁 Estrutura

```
├── index.html              # Interface principal
├── styles.css              # Estilos
├── script.js               # Lógica frontend
├── bot.js                  # Gerenciador de bots
├── discover-ids.js         # Descoberta de IDs
├── server-whatsapp-web.js  # Servidor WhatsApp
├── package.json            # Dependências
└── README.md               # Este arquivo
```

## 🎉 Sistema Pronto!

O projeto está **100% funcional** e pronto para uso!

**Repositório:** [https://github.com/Freschiii/BotShowdeOfertas.git](https://github.com/Freschiii/BotShowdeOfertas.git)