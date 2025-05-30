# Fala Baixo 🎤

Um aplicativo para monitoramento de volume de áudio em tempo real, com dashboard para visualização de dados.

## Funcionalidades

- Monitoramento de volume de áudio em tempo real
- Alertas quando o volume excede o limite configurado
- Integração com Telegram para notificações
- Dashboard para visualização de dados
- Exportação de dados para Excel
- Interface gráfica intuitiva

## Requisitos

- Python 3.x
- Node.js (para a dashboard)
- Dependências Python (ver requirements.txt)
- Dependências Node.js (ver package.json)
- Bot do Telegram (para notificações)

## Configuração

### Telegram Bot

1. Crie um bot no Telegram usando o [@BotFather](https://t.me/botfather)
2. Copie o token do bot fornecido
3. Obtenha seu Chat ID (você pode usar o [@userinfobot](https://t.me/userinfobot))
4. Abra o arquivo `falabaixo.py` e substitua:
   - `SEU_TOKEN_AQUI` pelo token do seu bot
   - `SEU_CHAT_ID_AQUI` pelo seu chat ID

## Instalação

### Backend (Python)

```bash
pip install -r requirements.txt
```

### Dashboard (Next.js)

```bash
cd dashboard
npm install --legacy-peer-deps
# ou
pnpm install --legacy-peer-deps
```

## Uso

### Iniciar o Monitor de Áudio

```bash
python falabaixo.py
```

### Iniciar a Dashboard

```bash
cd dashboard
npm run dev
# ou
pnpm dev
```

Acesse a dashboard em: http://localhost:3000

## Tecnologias Utilizadas

- Python
- Tkinter
- SoundDevice
- Next.js
- Tailwind CSS
- TypeScript
