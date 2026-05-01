# waview

PoC tool to save view-once (and other) media and optionally forward it to a configured telegram chat. Can also be used to see deleted messages/media.

## Disclaimer
This is a demonstration intended for educational purposes only, and shows a possible vulnerability in Whatsapp's view once feature.

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

## Configuration

`TELEGRAM_BOT_TOKEN` is the token from BotFather.

`CHAT_ID` is the Telegram chat ID where messages and media should be sent.

`SEND_REGULAR_MEDIA=true` forwards regular DM media to Telegram. View-once media is always forwarded when Telegram credentials are configured.

`SEND_TEXT_MESSAGES=true` forwards DM text messages to Telegram. Leave it `false` to skip text messages.

`CLEAN_DOWNLOADS=true` cleans the `downloads/` folder every 48 hours and sends a Telegram notification. Set it to `false` to disable cleanup.

## Run

```bash
npm start
```

On first run, scan the QR code printed in the terminal with WhatsApp. Subsequent runs will attempt to use the saved authdata (unless whatsapp does something to it)

## Behavior

View-once images and videos are saved to `downloads/` and sent to Telegram.

Regular DM images, videos, and voice messages are also saved to `downloads/`; they are sent to Telegram only when `SEND_REGULAR_MEDIA=true`.

DM text messages are sent to Telegram only when `SEND_TEXT_MESSAGES=true`.

Telegram sends include sender metadata: name, sender JID, time, and the sender's device type (best effor basis)

Disconnects, presence errors, download errors, unhandled rejections, and uncaught exceptions are sent to Telegram when credentials are configured.

When `CLEAN_DOWNLOADS=true`, the `downloads/` folder is cleaned every 48 hours, followed by a Telegram notification: `cleaned downloads folder`.
