const fs = require('fs')
const path = `${__dirname}/../node_modules/minecraft-protocol/src/client/tokens.js`
fs.writeFileSync(path, fs.readFileSync(path, 'utf-8').replace(/require\(this.cacheLocation\)/g, `require(\`\${this.cacheLocation}\`)`))
