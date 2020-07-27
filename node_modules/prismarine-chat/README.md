# prismarine-chat
[![NPM version](https://img.shields.io/npm/v/prismarine-chat.svg)](http://npmjs.com/package/prismarine-chat)
[![Build Status](https://github.com/PrismarineJS/prismarine-chat/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-chat/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-chat)

A parser for a minecraft chat message


## Usage

```js
const ChatMessage = require('prismarine-chat')('1.16')

const msg = new ChatMessage({"text":"Example chat mesasge"})
console.log(msg.toString()) // Example chat message

```
## API
### ChatMessage(message)
* `message` - Can be either text or a minecraft chat JSON object

#### chat.toString([lang])

Flattens the message in to plain-text
 * `lang` - (optional) - Set a custom lang (defaults to mcData.language)

#### chat.toMotd([lang], parent)

Converts to motd format
 * `lang` - (optional) - Set a custom lang (defaults to mcData.language)
 * `parent` - Set a custom lang (defaults to mcData.language)

#### chat.getText(idx, [lang])

Returns a text part from the message
 * `idx` - Index of the part
 * `lang` - (optional) - Set a custom lang (defaults to mcData.language)

#### chat.toAnsi([lang])

Converts to ansi format
 * `lang` - (optional) - Set a custom lang (defaults to mcData.language)

#### chat.length()

Returns the count of text extras and child ChatMessages
Does not count recursively in to the children
