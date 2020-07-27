module.exports = {
  Read: {
    'pstring': ['parametrizable', (compiler, string) => {
      let code = ''
      if (string.countType) {
        code += 'const { value: count, size: countSize } = ' + compiler.callType(string.countType) + '\n'
      } else if (string.count) {
        code += 'const count = ' + string.count + '\n'
        code += 'const countSize = 0\n'
      } else {
        throw new Error('pstring must contain either count or countType')
      }
      code += 'offset += countSize\n'
      code += 'if (offset + count > buffer.length) {\n'
      code += '  throw new PartialReadError("Missing characters in string, found size is " + buffer.length + " expected size was " + (offset + count))\n'
      code += '}\n'
      code += 'return { value: buffer.toString(\'utf8\', offset, offset + count), size: count + countSize }'
      return compiler.wrapCode(code)
    }],
    'buffer': ['parametrizable', (compiler, buffer) => {
      let code = ''
      if (buffer.countType) {
        code += 'const { value: count, size: countSize } = ' + compiler.callType(buffer.countType) + '\n'
      } else if (buffer.count) {
        code += 'const count = ' + buffer.count + '\n'
        code += 'const countSize = 0\n'
      } else {
        throw new Error('buffer must contain either count or countType')
      }
      code += 'offset += countSize\n'
      code += 'if (offset + count > buffer.length) {\n'
      code += '  throw new PartialReadError()\n'
      code += '}\n'
      code += 'return { value: buffer.slice(offset, offset + count), size: count + countSize }'
      return compiler.wrapCode(code)
    }],
    'bitfield': ['parametrizable', (compiler, values) => {
      let code = ''
      const totalBytes = Math.ceil(values.reduce((acc, { size }) => acc + size, 0) / 8)
      code += `if ( offset + ${totalBytes} > buffer.length) { throw new PartialReadError() }\n`

      let names = []
      let totalSize = 8
      code += 'let bits = buffer[offset++]\n'
      for (const i in values) {
        const { name, size, signed } = values[i]
        const trueName = compiler.getField(name)
        while (totalSize < size) {
          totalSize += 8
          code += `bits = (bits << 8) | buffer[offset++]\n`
        }
        code += `let ${trueName} = (bits >> ` + (totalSize - size) + ') & 0x' + ((1 << size) - 1).toString(16) + '\n'
        if (signed) code += `${trueName} -= (${trueName} & 0x` + (1 << (size - 1)).toString(16) + ') << 1\n'
        totalSize -= size
        if (name === trueName) names.push(name)
        else names.push(`${name}: ${trueName}`)
      }
      code += 'return { value: { ' + names.join(', ') + ` }, size: ${totalBytes} }`
      return compiler.wrapCode(code)
    }],
    'mapper': ['parametrizable', (compiler, mapper) => {
      let code = 'const { value, size } = ' + compiler.callType(mapper.type) + '\n'
      code += 'return { value: ' + JSON.stringify(sanitizeMappings(mapper.mappings)) + '[value], size }'
      return compiler.wrapCode(code)
    }]
  },

  Write: {
    'pstring': ['parametrizable', (compiler, string) => {
      let code = 'const length = Buffer.byteLength(value, \'utf8\')\n'
      if (string.countType) {
        code += 'offset = ' + compiler.callType('length', string.countType) + '\n'
      } else if (string.count === null) {
        throw new Error('pstring must contain either count or countType')
      }
      code += 'buffer.write(value, offset, length, \'utf8\')\n'
      code += 'return offset + length'
      return compiler.wrapCode(code)
    }],
    'buffer': ['parametrizable', (compiler, buffer) => {
      let code = ''
      if (buffer.countType) {
        code += 'offset = ' + compiler.callType('value.length', buffer.countType) + '\n'
      } else if (buffer.count === null) {
        throw new Error('buffer must contain either count or countType')
      }
      code += 'value.copy(buffer, offset)\n'
      code += 'return offset + value.length'
      return compiler.wrapCode(code)
    }],
    'bitfield': ['parametrizable', (compiler, values) => {
      let toWrite = ''
      let bits = 0
      let code = ''
      for (const i in values) {
        let { name, size } = values[i]
        const trueName = compiler.getField(name)
        code += `let ${trueName} = value.${name}\n`
        while (size > 0) {
          const writeBits = Math.min(8 - bits, size)
          const mask = ((1 << writeBits) - 1)
          if (toWrite !== '') toWrite = `((${toWrite}) << ${writeBits}) | `
          toWrite += `((${trueName} >> ` + (size - writeBits) + ') & 0x' + mask.toString(16) + ')'
          size -= writeBits
          bits += writeBits
          if (bits === 8) {
            code += 'buffer[offset++] = ' + toWrite + '\n'
            bits = 0
            toWrite = ''
          }
        }
      }
      if (bits !== 0) {
        code += 'buffer[offset++] = (' + toWrite + ') << ' + (8 - bits) + '\n'
      }
      code += 'return offset'
      return compiler.wrapCode(code)
    }],
    'mapper': ['parametrizable', (compiler, mapper) => {
      const mappings = JSON.stringify(swapMappings(mapper.mappings))
      const code = 'return ' + compiler.callType(`${mappings}[value]`, mapper.type)
      return compiler.wrapCode(code)
    }]
  },

  SizeOf: {
    'pstring': ['parametrizable', (compiler, string) => {
      let code = 'let size = Buffer.byteLength(value, \'utf8\')\n'
      if (string.countType) {
        code += 'size += ' + compiler.callType('size', string.countType) + '\n'
      } else if (string.count === null) {
        throw new Error('pstring must contain either count or countType')
      }
      code += 'return size'
      return compiler.wrapCode(code)
    }],
    'buffer': ['parametrizable', (compiler, buffer) => {
      let code = 'let size = value.length\n'
      if (buffer.countType) {
        code += 'size += ' + compiler.callType('size', buffer.countType) + '\n'
      } else if (buffer.count === null) {
        throw new Error('buffer must contain either count or countType')
      }
      code += 'return size'
      return compiler.wrapCode(code)
    }],
    'bitfield': ['parametrizable', (compiler, values) => {
      const totalBytes = Math.ceil(values.reduce((acc, { size }) => acc + size, 0) / 8)
      return `${totalBytes}`
    }],
    'mapper': ['parametrizable', (compiler, mapper) => {
      const mappings = JSON.stringify(swapMappings(mapper.mappings))
      const code = 'return ' + compiler.callType(`${mappings}[value]`, mapper.type)
      return compiler.wrapCode(code)
    }]
  }
}

// Convert hexadecimal keys to decimal
function sanitizeMappings (json) {
  const ret = {}
  for (let key in json) {
    let val = json[key]
    key = hex2dec(key)
    ret[key] = val
  }
  return ret
}

function swapMappings (json) {
  const ret = {}
  for (let key in json) {
    let val = json[key]
    key = hex2dec(key)
    ret[val] = (isNaN(key)) ? key : parseInt(key, 10)
  }
  return ret
}

function hex2dec (num) {
  if ((num.match(/^0x[0-9a-f]+$/i))) { return parseInt(num.substring(2), 16) }
  return num
}
