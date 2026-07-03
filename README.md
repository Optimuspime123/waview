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
CHAT_ID=your_chat_id_here
SEND_REGULAR_MEDIA=true
SEND_TEXT_MESSAGES=false
CLEAN_DOWNLOADS=true
```

`CHAT_ID` is both the destination for forwarded WhatsApp messages and the
allowlist for inbound bot commands. Updates from every other Telegram chat are
ignored.

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

## Telegram sticker bridge

When `TELEGRAM_BOT_TOKEN` and `CHAT_ID` are configured, the process uses the raw
Telegram Bot API long-polling endpoint. Send `/sticker` in the configured chat
and use the inline keyboard to:

1. Browse by emoji or pack, or request a random sticker.
2. Choose or confirm the exact Lottie animation name extracted from the `.was`
   archive.
3. Reply with the WhatsApp recipient.

Accepted recipients are international phone numbers and JIDs ending in
`@s.whatsapp.net`, `@c.us`, `@lid`, or `@g.us`. Phone numbers are checked using
WhatsApp account lookup, groups are checked against the connected account, and
LIDs are syntax-checked because WhatsApp does not expose an equivalent public
LID lookup.

Use `/cancel` to discard an active selection. Selections expire after 15
minutes. The bridge reuses the existing WhatsApp socket and refuses to start a
send while WhatsApp is disconnected.

## Behavior

View-once images and videos are saved to `downloads/` and sent to Telegram.

Regular DM images, videos, and voice messages are also saved to `downloads/`; they are sent to Telegram only when `SEND_REGULAR_MEDIA=true`.

DM text messages are sent to Telegram only when `SEND_TEXT_MESSAGES=true`.

Telegram sends include sender metadata: name, sender JID, time, and the sender's device type (best effort basis).

Disconnects, presence errors, download errors, unhandled rejections, and uncaught exceptions are sent to Telegram when credentials are configured.

When `CLEAN_DOWNLOADS=true`, the `downloads/` folder is cleaned every 48 hours, followed by a Telegram notification: `cleaned downloads folder`.
