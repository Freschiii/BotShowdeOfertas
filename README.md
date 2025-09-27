# 🚀 Projeto Show de Ofertas

Sistema completo para envio de mensagens via WhatsApp e Telegram com agendamento e histórico.

## 📋 Funcionalidades

- ✅ **Múltiplas caixas de mensagem** - Crie quantas mensagens quiser
- ✅ **Agendamento inteligente** - Hoje/Amanhã com horário específico
- ✅ **Histórico completo** - Todas as mensagens enviadas e agendadas
- ✅ **Reset automático** - Limpeza após envio para evitar duplicatas
- ✅ **Interface moderna** - Design dark mode responsivo
- ✅ **Conexão automática** - WhatsApp e Telegram conectam automaticamente
- ✅ **Portável** - Funciona em qualquer computador!

## 🚀 Como Executar

### 🎯 **PRIMEIRA VEZ (Instalação)**
```bash
# 1. Baixe o projeto do GitHub
# 2. Clique duplo em:
install.bat
# ou
install.ps1
```

### ⚡ **USO DIÁRIO (Após instalação)**
```bash
# Clique duplo em:
start.bat
# ou
start.ps1
```

### 🔧 **Manual (Avançado)**
```bash
# Navegue para o diretório do projeto
cd "caminho/para/o/projeto"

# Instale dependências (primeira vez)
npm install

# Inicie o servidor
node server.js
```

## 🌐 Acesso

Após executar, acesse: **http://localhost:3000**

## 📱 Configuração

### WhatsApp
- Conecta automaticamente ao carregar a página
- QR Code será exibido para autenticação

### Telegram
- Token salvo automaticamente no localStorage
- Conecta automaticamente se token válido

## 🎯 Como Usar

1. **Digite sua mensagem** na primeira caixa
2. **Adicione imagens** (opcional) - arraste e solte ou clique para selecionar
3. **Agende** (opcional) - clique no ícone do relógio
4. **Adicione mais mensagens** - clique no botão "+"
5. **Envie** - clique em "Enviar Mensagens"

## 🔧 Recursos Avançados

- **Reset de agendamento** - Ícone no canto superior direito
- **Histórico compacto** - Visualize todas as mensagens enviadas
- **Reset automático** - Limpeza completa após envio
- **Múltiplas plataformas** - Envie para WhatsApp, Telegram ou ambos

## 📁 Estrutura do Projeto

```
Projeto Show de Ofertas/
├── index.html          # Interface principal
├── script.js           # Lógica JavaScript
├── styles.css          # Estilos CSS
├── server.js           # Servidor Node.js
├── bot.js              # Gerenciador de bots
├── start.bat           # Executador Windows
├── start.ps1           # Executador PowerShell
└── package.json        # Dependências
```

## 🛠️ Dependências

- Node.js
- Express
- Socket.IO
- Baileys (WhatsApp)
- Telegraf (Telegram)

## 📞 Suporte

### 🆘 **Problemas Comuns:**

1. **"Node.js não encontrado"**
   - Baixe em: https://nodejs.org/
   - Reinicie o computador após instalar

2. **"Falha ao instalar dependências"**
   - Verifique conexão com internet
   - Execute como administrador
   - Tente: `npm cache clean --force`

3. **"Porta 3000 em uso"**
   - Feche outros programas que usam a porta 3000
   - Reinicie o computador

4. **"WhatsApp não conecta"**
   - Verifique se o WhatsApp Web está fechado
   - Escaneie o QR Code novamente

### 🔧 **Para Desenvolvedores:**
- Clone o repositório
- Execute `install.bat` (primeira vez)
- Execute `start.bat` (uso diário)
- Acesse `http://localhost:3000`

---
**Desenvolvido com ❤️ para facilitar o envio de ofertas!**

### 📱 **Compatibilidade:**
- ✅ Windows 10/11
- ✅ Qualquer computador
- ✅ Funciona offline (após instalação)
- ✅ Portável (copie a pasta para qualquer lugar)