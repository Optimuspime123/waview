import makeWASocket, { useMultiFileAuthState, DisconnectReason, downloadMediaMessage } from '@whiskeysockets/baileys'
import pino from 'pino'
import { writeFileSync, mkdirSync } from 'fs'
import qrcode from 'qrcode-terminal'

mkdirSync('./downloads', { recursive: true })

async function startSpoofedSession() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_android_bypass')

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        // THE BYPASS: Register as an Android companion device
        browser: ['Android', 'WhatsApp', '2.26.16.73'],
        syncFullHistory: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            qrcode.generate(qr, { small: true }, (code) => {
                console.log('\nScan this QR code with WhatsApp:\n')
                console.log(code)
            })
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            console.log(`Connection closed. Reconnecting: ${shouldReconnect}`)
            if (shouldReconnect) startSpoofedSession()
        } else if (connection === 'open') {
            console.log('Connected. Waiting for View Once messages...')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const msg of messages) {
            if (!msg.message) continue

            const sender = msg.key.remoteJid

            const viewOnceWrapper = msg.message.viewOnceMessageV2
                || msg.message.viewOnceMessage
                || msg.message.viewOnceMessageV2Extension

            if (viewOnceWrapper) {
                const inner = viewOnceWrapper.message
                const mediaType = inner?.imageMessage ? 'image' : inner?.videoMessage ? 'video' : 'unknown'
                const ext = mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'bin'

                console.log(`\n[VIEW ONCE] from ${sender} (${mediaType})`)
                console.log('Payload:', JSON.stringify(viewOnceWrapper, null, 2))

                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {})
                    const filename = `./downloads/viewonce_${Date.now()}.${ext}`
                    writeFileSync(filename, buffer)
                    console.log(`Saved: ${filename} (${buffer.length} bytes)`)
                } catch (err) {
                    console.log(`Download failed: ${err.message}`)
                }

                console.log('--------------------------------------------------\n')
            } else {
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Non-text media]'
                console.log(`[Normal] ${sender?.split('@')[0]}: ${text}`)
            }
        }
    })
}

startSpoofedSession()
