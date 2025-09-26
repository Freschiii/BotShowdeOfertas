# 🤖 Configuração Real dos Bots

## ⚠️ **IMPORTANTE: Para Funcionar de Verdade**

O sistema atual está **simulando** as conexões. Para funcionar de verdade, você precisa configurar os bots reais.

## 📱 **Telegram Bot (Funciona Agora)**

### 1. Criar Bot no Telegram
1. **Abra o Telegram** e procure por `@BotFather`
2. **Digite** `/newbot`
3. **Escolha um nome** para seu bot (ex: "Show de Ofertas Bot")
4. **Escolha um username** (deve terminar em 'bot', ex: "show_ofertas_bot")
5. **Copie o token** gerado (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Adicionar Bot ao Canal
1. **Crie um canal** no Telegram
2. **Adicione o bot** como administrador
3. **Dê permissões** para enviar mensagens
4. **Obtenha o ID** do canal usando @userinfobot

### 3. Configurar no Sistema
1. **Cole o token** no campo "Token do Bot Telegram"
2. **Clique em "Conectar"**
3. **Configure o ID do canal** no campo "Canal Telegram"
4. **Salve as configurações**

## 📱 **WhatsApp Bot (Precisa de Implementação Real)**

### Opção 1: WhatsApp Business API (Pago)
1. **Acesse** [Facebook Developers](https://developers.facebook.com/)
2. **Crie um app** e configure WhatsApp Business API
3. **Obtenha o token** de acesso
4. **Configure o webhook** para receber mensagens

### Opção 2: WhatsApp Web.js (Gratuito - Recomendado)
```bash
# Instalar dependências
npm install whatsapp-web.js qrcode-terminal

# Criar arquivo whatsapp-bot.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp Bot conectado!');
});

client.initialize();
```

### Opção 3: Baileys (Gratuito)
```bash
# Instalar dependências
npm install @whiskeysockets/baileys

# Criar arquivo baileys-bot.js
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
});

sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
            connectToWhatsApp();
        }
    } else if (connection === 'open') {
        console.log('WhatsApp Bot conectado!');
    }
});
```

## 🚀 **Implementação Completa**

### 1. Estrutura do Projeto
```
projeto/
├── index.html
├── styles.css
├── script.js
├── bot.js
├── server.js          # Servidor Node.js
├── whatsapp-bot.js    # Bot WhatsApp real
├── telegram-bot.js    # Bot Telegram real
└── package.json
```

### 2. package.json
```json
{
  "name": "show-ofertas-bot",
  "version": "1.0.0",
  "description": "Bot para WhatsApp e Telegram",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "whatsapp-web.js": "^1.23.0",
    "node-telegram-bot-api": "^0.64.0",
    "qrcode": "^1.5.3",
    "socket.io": "^4.7.2"
  }
}
```

### 3. server.js
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    socket.on('connect-whatsapp', () => {
        // Lógica para conectar WhatsApp
    });
    
    socket.on('connect-telegram', (token) => {
        // Lógica para conectar Telegram
    });
    
    socket.on('send-message', (data) => {
        // Lógica para enviar mensagem
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
```

## 🔧 **Configuração Atual (Simulada)**

### Para Testar Agora:
1. **Telegram:** Use um token real do @BotFather
2. **WhatsApp:** O QR Code é simulado, mas você pode testar a interface
3. **Envio:** O Telegram funcionará se configurado corretamente

### Para Produção:
1. **Implemente os bots reais** usando as opções acima
2. **Configure um servidor** Node.js
3. **Faça deploy** em uma plataforma como Heroku, Vercel ou Railway

## 💡 **Dicas Importantes**

### Telegram:
- ✅ **Token gratuito** e ilimitado
- ✅ **Funciona imediatamente** se configurado corretamente
- ✅ **Sem custos** de operação

### WhatsApp:
- ❌ **API oficial é paga** (Facebook Business)
- ✅ **WhatsApp Web.js é gratuito** mas requer servidor
- ✅ **Baileys é gratuito** e mais leve

### Deploy:
- ✅ **Heroku:** Gratuito com limitações
- ✅ **Vercel:** Gratuito para projetos pessoais
- ✅ **Railway:** Gratuito com créditos
- ✅ **Render:** Gratuito com limitações

## 🎯 **Próximos Passos**

1. **Teste o Telegram** com token real
2. **Configure um servidor** Node.js
3. **Implemente WhatsApp** com uma das opções
4. **Faça deploy** em uma plataforma gratuita
5. **Teste tudo** em produção

---

**Feito com ❤️ para ajudar no Show de Ofertas!**
