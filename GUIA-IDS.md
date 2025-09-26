# 🔍 Guia Completo: Como Descobrir IDs dos Grupos

## 📱 **WhatsApp - Descobrir ID do Grupo**

### Método 1: Via WhatsApp Web (Mais Fácil)
1. **Abra o WhatsApp Web** no seu navegador
2. **Vá para o grupo** que você quer usar
3. **Abra o DevTools** (pressione F12)
4. **Vá na aba Console**
5. **Digite este código:**
```javascript
// Para descobrir o ID do grupo
window.Store.Chat.models.find(chat => chat.name === 'NOME_DO_GRUPO').id._serialized
```

### Método 2: Via Código JavaScript
```javascript
// Listar todos os grupos
window.Store.Chat.models
    .filter(chat => chat.isGroup)
    .map(chat => ({
        name: chat.name,
        id: chat.id._serialized,
        participants: chat.participants.length
    }))
```

### Método 3: Via WhatsApp Business API
1. **Acesse** [Facebook Developers](https://developers.facebook.com/)
2. **Crie um app** e configure WhatsApp Business API
3. **Use o webhook** para receber mensagens
4. **O ID do grupo** virá nas mensagens recebidas

## 📱 **Telegram - Descobrir ID do Grupo**

### Método 1: Via @userinfobot (Mais Fácil)
1. **Adicione o bot** [@userinfobot](https://t.me/userinfobot) ao seu grupo
2. **Digite** `/start` no grupo
3. **O bot responderá** com o ID do grupo
4. **Copie o ID** (formato: `-1001234567890`)

### Método 2: Via @getidsbot
1. **Adicione o bot** [@getidsbot](https://t.me/getidsbot) ao seu grupo
2. **Digite** `/getids` no grupo
3. **O bot mostrará** o ID do grupo

### Método 3: Via API do Telegram
1. **Obtenha o token** do seu bot
2. **Acesse esta URL:**
```
https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
```
3. **Envie uma mensagem** no grupo
4. **Recarregue a URL** e procure por `chat.id`

### Método 4: Via Código
```javascript
// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');

const token = 'SEU_TOKEN_AQUI';
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    console.log('ID do Grupo:', msg.chat.id);
    console.log('Nome do Grupo:', msg.chat.title);
    console.log('Tipo:', msg.chat.type);
});
```

## 🛠️ **Usando a Interface do Sistema**

### Para WhatsApp:
1. **Abra o WhatsApp Web** no seu navegador
2. **Vá para o sistema** e clique em "Descobrir Grupos WhatsApp"
3. **O sistema automaticamente** encontrará todos os grupos
4. **Clique em "Copiar ID"** para copiar o ID do grupo desejado

### Para Telegram:
1. **Digite o token** do seu bot no campo
2. **Clique em "Descobrir Grupos Telegram"**
3. **O sistema automaticamente** encontrará todos os grupos
4. **Clique em "Copiar ID"** para copiar o ID do grupo desejado

## 📋 **Exemplos de IDs**

### WhatsApp:
```
120363123456789012@g.us
```
- Formato: `número@g.us`
- O `@g.us` indica que é um grupo

### Telegram:
```
-1001234567890
```
- Formato: `-100` + número
- O `-100` indica que é um grupo

## 🔧 **Configuração no Sistema**

### 1. WhatsApp:
- **Cole o ID** no campo "Grupo WhatsApp"
- **Exemplo:** `120363123456789012@g.us`

### 2. Telegram:
- **Cole o ID** no campo "Grupo Telegram"
- **Exemplo:** `-1001234567890`

## ⚠️ **Dicas Importantes**

### WhatsApp:
- ✅ **Use WhatsApp Web** para descobrir IDs
- ✅ **O grupo deve estar** no seu WhatsApp
- ✅ **Você deve ser** administrador do grupo
- ❌ **Não funciona** com grupos privados

### Telegram:
- ✅ **O bot deve estar** no grupo
- ✅ **O bot deve ter** permissões para enviar mensagens
- ✅ **Use bots oficiais** para descobrir IDs
- ❌ **Não funciona** com grupos privados sem permissão

## 🚀 **Testando a Configuração**

### 1. Configure os IDs no sistema
### 2. Conecte os bots
### 3. Envie uma mensagem de teste
### 4. Verifique se chegou nos grupos

## 💡 **Solução de Problemas**

### WhatsApp não encontra grupos:
- ✅ Abra o WhatsApp Web primeiro
- ✅ Certifique-se de estar logado
- ✅ Recarregue a página do sistema

### Telegram não encontra grupos:
- ✅ Verifique se o token está correto
- ✅ Adicione o bot aos grupos primeiro
- ✅ Envie uma mensagem no grupo

### IDs não funcionam:
- ✅ Verifique se o formato está correto
- ✅ Teste enviando uma mensagem manual
- ✅ Verifique se o bot tem permissões

---

**Feito com ❤️ para ajudar no Show de Ofertas!**
