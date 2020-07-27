const ChatMessage = require('prismarine-chat')('1.16')

const msg = new ChatMessage({ text: 'Example chat message' })
console.log(msg.toString()) // Example chat message
