# waview

PoC tool to save view-once (and other) media and optionally forward it to a configured telegram chat. Can also be used to see deleted messages/media. And send whatsapp plus stickers without a subscription

## Disclaimer
This is a demonstration intended for educational purposes only, and shows possible vulnerability in Whatsapp's infra. 

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Fill in Telegram settings in `.env`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## 📦 Premium Lottie Stickers Module (`sendstickers.js`)

`sendstickers.js` is a self-contained, highly modular script that enables downloading, decrypting, selecting, and relaying official WhatsApp premium Lottie stickers (`.was` files).
Reuses existing sockets to prevent concurrent session invalidation conflicts!

### Run Interactively
To start the interactive command-line interface:
```bash
node sendstickers.js
```

### Programmatic Usage
```javascript
import { sendPremiumSticker } from './sendstickers.js'

// Example: Relay an animated sticker using your active Baileys socket
await sendPremiumSticker({
    jid: 'recipient_jid@lid',
    packId: 'PomPom',
    emoji: '😎',
    sock: myActiveSocket // Prevents credential collisions!
})
```

---

## Run (View-Once Bypass)

```bash
npm start
```

On first run, scan the QR code printed in the terminal with WhatsApp. Subsequent runs will attempt to use the saved authdata (unless whatsapp does something to it).

## Behavior

View-once images and videos are saved to `downloads/` and sent to Telegram.

Regular DM images, videos, and voice messages are also saved to `downloads/`; they are sent to Telegram only when `SEND_REGULAR_MEDIA=true`.

DM text messages are sent to Telegram only when `SEND_TEXT_MESSAGES=true`.

Telegram sends include sender metadata: name, sender JID, time, and the sender's device type (best effort basis).

Disconnects, presence errors, download errors, unhandled rejections, and uncaught exceptions are sent to Telegram when credentials are configured.

When `CLEAN_DOWNLOADS=true`, the `downloads/` folder is cleaned every 48 hours, followed by a Telegram notification: `cleaned downloads folder`.
