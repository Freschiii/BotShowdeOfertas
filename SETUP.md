# 🤖 Setup dos Bots - Show de Ofertas

## 📱 Configuração WhatsApp Bot

### 1. Obter Token do WhatsApp Business API
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie uma conta ou faça login
3. Crie um novo app
4. Adicione o produto "WhatsApp Business API"
5. Configure o webhook e obtenha o token

### 2. Configuração Local (Alternativa)
Para uso local sem API oficial, você pode usar:

#### Opção A: WhatsApp Web API (Gratuito)
```bash
npm install whatsapp-web.js
```

#### Opção B: Baileys (Gratuito)
```bash
npm install @whiskeysockets/baileys
```

### 3. Código de Exemplo
```javascript
// whatsapp-bot.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client();

client.on('qr', (qr) => {
    console.log('QR Code gerado!');
    qrcode.toDataURL(qr, (err, url) => {
        // Enviar QR Code para o frontend
    });
});

client.on('ready', () => {
    console.log('WhatsApp Bot conectado!');
});

client.on('message', async (message) => {
    // Lógica para responder mensagens
});

client.initialize();
```

## 📱 Configuração Telegram Bot

### 1. Criar Bot no Telegram
1. Abra o Telegram e procure por `@BotFather`
2. Digite `/newbot`
3. Escolha um nome para seu bot
4. Escolha um username (deve terminar em 'bot')
5. Copie o token gerado

### 2. Obter ID do Grupo
1. Adicione seu bot ao grupo
2. Envie uma mensagem no grupo
3. Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
4. Copie o `chat.id` do grupo

### 3. Código de Exemplo
```javascript
// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');

const token = 'SEU_TOKEN_AQUI';
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Lógica para responder mensagens
    bot.sendMessage(chatId, 'Mensagem recebida!');
});

// Função para enviar mensagem
function sendMessage(chatId, message, image) {
    if (image) {
        bot.sendPhoto(chatId, image, {caption: message});
    } else {
        bot.sendMessage(chatId, message);
    }
}
```

## 🚀 Implementação Completa

### 1. Estrutura do Projeto
```
projeto/
├── index.html
├── styles.css
├── script.js
├── bot.js
├── server.js          # Servidor Node.js
├── whatsapp-bot.js    # Bot WhatsApp
├── telegram-bot.js    # Bot Telegram
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

## 🔧 Configuração de Produção

### 1. Variáveis de Ambiente
Crie um arquivo `.env`:
```
WHATSAPP_TOKEN=seu_token_whatsapp
TELEGRAM_TOKEN=seu_token_telegram
WHATSAPP_GROUP=id_do_grupo_whatsapp
TELEGRAM_GROUP=id_do_grupo_telegram
```

### 2. Deploy
#### Opção A: Heroku (Gratuito)
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create seu-app-name

# Deploy
git push heroku main
```

#### Opção B: Vercel (Gratuito)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Opção C: Railway (Gratuito)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 📋 Checklist de Implementação

### WhatsApp Bot
- [ ] Criar app no Facebook Developers
- [ ] Configurar webhook
- [ ] Obter token de acesso
- [ ] Testar conexão
- [ ] Configurar grupo de destino

### Telegram Bot
- [ ] Criar bot com @BotFather
- [ ] Obter token do bot
- [ ] Adicionar bot ao grupo
- [ ] Obter ID do grupo
- [ ] Testar envio de mensagens

### Sistema Completo
- [ ] Configurar servidor Node.js
- [ ] Implementar WebSocket
- [ ] Testar comunicação em tempo real
- [ ] Configurar deploy
- [ ] Testar em produção

## 🎯 Próximos Passos

1. **Configure os bots** seguindo as instruções acima
2. **Teste localmente** antes de fazer deploy
3. **Configure as variáveis de ambiente**
4. **Faça deploy** em uma plataforma gratuita
5. **Teste em produção** com grupos reais

## 💡 Dicas Importantes

- **WhatsApp**: Use sempre a API oficial para evitar bloqueios
- **Telegram**: O token é gratuito e ilimitado
- **Grupos**: Configure os IDs corretos dos grupos
- **Imagens**: Otimize o tamanho das imagens
- **Rate Limits**: Respeite os limites das APIs

---

**Feito com ❤️ para ajudar no Show de Ofertas!**
