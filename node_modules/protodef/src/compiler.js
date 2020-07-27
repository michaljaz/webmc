const numeric = require('./datatypes/numeric')
const utils = require('./datatypes/utils')

const conditionalDatatypes = require('./datatypes/compiler-conditional')
const structuresDatatypes = require('./datatypes/compiler-structures')
const utilsDatatypes = require('./datatypes/compiler-utils')

const { tryCatch } = require('./utils')

class ProtoDefCompiler {
  constructor () {
    this.readCompiler = new ReadCompiler()
    this.writeCompiler = new WriteCompiler()
    this.sizeOfCompiler = new SizeOfCompiler()
  }

  addTypes (types) {
    this.readCompiler.addTypes(types.Read)
    this.writeCompiler.addTypes(types.Write)
    this.sizeOfCompiler.addTypes(types.SizeOf)
  }

  addTypesToCompile (types) {
    this.readCompiler.addTypesToCompile(types)
    this.writeCompiler.addTypesToCompile(types)
    this.sizeOfCompiler.addTypesToCompile(types)
  }

  addProtocol (protocolData, path) {
    this.readCompiler.addProtocol(protocolData, path)
    this.writeCompiler.addProtocol(protocolData, path)
    this.sizeOfCompiler.addProtocol(protocolData, path)
  }

  compileProtoDefSync (options = { printCode: false }) {
    const sizeOfCode = this.sizeOfCompiler.generate()
    const writeCode = this.writeCompiler.generate()
    const readCode = this.readCompiler.generate()
    if (options.printCode) {
      console.log('// SizeOf:')
      console.log(sizeOfCode)
      console.log('// Write:')
      console.log(writeCode)
      console.log('// Read:')
      console.log(readCode)
    }
    const sizeOfCtx = this.sizeOfCompiler.compile(sizeOfCode)
    const writeCtx = this.writeCompiler.compile(writeCode)
    const readCtx = this.readCompiler.compile(readCode)
    return new CompiledProtodef(sizeOfCtx, writeCtx, readCtx)
  }
}

class CompiledProtodef {
  constructor (sizeOfCtx, writeCtx, readCtx) {
    this.sizeOfCtx = sizeOfCtx
    this.writeCtx = writeCtx
    this.readCtx = readCtx
  }

  read (buffer, cursor, type) {
    const readFn = this.readCtx[type]
    if (!readFn) { throw new Error('missing data type: ' + type) }
    return readFn(buffer, cursor)
  }

  write (value, buffer, cursor, type) {
    const writeFn = this.writeCtx[type]
    if (!writeFn) { throw new Error('missing data type: ' + type) }
    return writeFn(value, buffer, cursor)
  }

  sizeOf (value, type) {
    const sizeFn = this.sizeOfCtx[type]
    if (!sizeFn) { throw new Error('missing data type: ' + type) }
    if (typeof sizeFn === 'function') {
      return sizeFn(value)
    } else {
      return sizeFn
    }
  }

  createPacketBuffer (type, packet) {
    const length = tryCatch(() => this.sizeOf(packet, type),
      (e) => {
        e.message = `SizeOf error for ${e.field} : ${e.message}`
        throw e
      })
    const buffer = Buffer.allocUnsafe(length)
    tryCatch(() => this.write(packet, buffer, 0, type),
      (e) => {
        e.message = `Write error for ${e.field} : ${e.message}`
        throw e
      })
    return buffer
  }

  parsePacketBuffer (type, buffer) {
    const { value, size } = tryCatch(() => this.read(buffer, 0, type),
      (e) => {
        e.message = `Read error for ${e.field} : ${e.message}`
        throw e
      })
    return {
      data: value,
      metadata: { size },
      buffer: buffer.slice(0, size)
    }
  }
}

class Compiler {
  constructor () {
    this.primitiveTypes = {}
    this.native = {}
    this.context = {}
    this.types = {}
    this.scopeStack = []
    this.parameterizableTypes = {}
  }

  /**
   * A native type is a type read or written by a function that will be called in it's
   * original context.
   * @param {*} type
   * @param {*} fn
   */
  addNativeType (type, fn) {
    this.primitiveTypes[type] = `native.${type}`
    this.native[type] = fn
    this.types[type] = 'native'
  }

  /**
   * A context type is a type that will be called in the protocol's context. It can refer to
   * registred native types using native.{type}() or context type (provided and generated)
   * using ctx.{type}(), but cannot access it's original context.
   * @param {*} type
   * @param {*} fn
   */
  addContextType (type, fn) {
    this.primitiveTypes[type] = `ctx.${type}`
    this.context[type] = fn.toString()
  }

  /**
   * A parametrizable type is a function that will be generated at compile time using the
   * provided maker function
   * @param {*} type
   * @param {*} maker
   */
  addParametrizableType (type, maker) {
    this.parameterizableTypes[type] = maker
  }

  addTypes (types) {
    for (const [type, [kind, fn]] of Object.entries(types)) {
      if (kind === 'native') this.addNativeType(type, fn)
      else if (kind === 'context') this.addContextType(type, fn)
      else if (kind === 'parametrizable') this.addParametrizableType(type, fn)
    }
  }

  addTypesToCompile (types) {
    for (const [type, json] of Object.entries(types)) {
      // Replace native type, otherwise first in wins
      if (!this.types[type] || this.types[type] === 'native') this.types[type] = json
    }
  }

  addProtocol (protocolData, path) {
    const self = this
    function recursiveAddTypes (protocolData, path) {
      if (protocolData === undefined) { return }
      if (protocolData.types) { self.addTypesToCompile(protocolData.types) }
      recursiveAddTypes(protocolData[path.shift()], path)
    }
    recursiveAddTypes(protocolData, path.slice(0))
  }

  indent (code, indent = '  ') {
    return code.split('\n').map((line) => indent + line).join('\n')
  }

  getField (name) {
    let path = name.split('/')
    let i = this.scopeStack.length - 1
    const reserved = { 'value': true, 'enum': true }
    while (path.length) {
      let scope = this.scopeStack[i]
      let field = path.shift()
      if (field === '..') {
        i--
        continue
      }
      // We are at the right level
      if (scope[field]) return scope[field] + (path.length ? ('.' + path.join('.')) : '')
      if (path.length !== 0) {
        throw new Error('Cannot access properties of undefined field')
      }
      // Count how many collision occured in the scope
      let count = 0
      if (reserved[field]) count++
      for (let j = 0; j < i; j++) {
        if (this.scopeStack[j][field]) count++
      }
      scope[field] = field + (count || '') // If the name is already used, add a number
      return scope[field]
    }
    throw new Error('Unknown field ' + path)
  }

  generate () {
    this.scopeStack = [{}]
    let functions = []
    for (const type in this.context) {
      functions[type] = this.context[type]
    }
    for (const type in this.types) {
      if (!functions[type]) {
        if (this.types[type] !== 'native') {
          functions[type] = this.compileType(this.types[type])
          if (functions[type].startsWith('ctx')) {
            functions[type] = 'function () { return ' + functions[type] + '(...arguments) }'
          }
          if (!isNaN(functions[type])) { functions[type] = this.wrapCode('  return ' + functions[type]) }
        } else {
          functions[type] = `native.${type}`
        }
      }
    }
    return '() => {\n' + this.indent('const ctx = {\n' + this.indent(Object.keys(functions).map((type) => {
      return type + ': ' + functions[type]
    }).join(',\n')) + '\n}\nreturn ctx') + '\n}'
  }

  /**
   * Compile the given js code, providing native.{type} to the context, return the compiled types
   * @param {*} code
   */
  compile (code) {
    // Local variable to provide some context to eval()
    const native = this.native // eslint-disable-line
    const { PartialReadError } = require('./utils') // eslint-disable-line
    return eval(code)() // eslint-disable-line
  }
}

class ReadCompiler extends Compiler {
  constructor () {
    super()

    this.addTypes(conditionalDatatypes.Read)
    this.addTypes(structuresDatatypes.Read)
    this.addTypes(utilsDatatypes.Read)

    // Add default types
    for (const key in numeric) {
      this.addNativeType(key, numeric[key][0])
    }
    for (const key in utils) {
      this.addNativeType(key, utils[key][0])
    }
  }

  compileType (type) {
    if (type instanceof Array) {
      if (this.parameterizableTypes[type[0]]) { return this.parameterizableTypes[type[0]](this, type[1]) }
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.wrapCode('return ' + this.callType(type[0], 'offset', Object.values(type[1])))
      }
      throw new Error('Unknown parametrizable type: ' + type[0])
    } else { // Primitive type
      if (type === 'native') return 'null'
      if (this.types[type]) { return 'ctx.' + type }
      return this.primitiveTypes[type]
    }
  }

  wrapCode (code, args = []) {
    if (args.length > 0) return '(buffer, offset, ' + args.join(', ') + ') => {\n' + this.indent(code) + '\n}'
    return '(buffer, offset) => {\n' + this.indent(code) + '\n}'
  }

  callType (type, offsetExpr = 'offset', args = []) {
    if (type instanceof Array) {
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.callType(type[0], offsetExpr, Object.values(type[1]))
      }
    }
    if (type instanceof Array && type[0] === 'container') this.scopeStack.push({})
    const code = this.compileType(type)
    if (type instanceof Array && type[0] === 'container') this.scopeStack.pop()
    if (args.length > 0) return '(' + code + `)(buffer, ${offsetExpr}, ` + args.map(name => this.getField(name)).join(', ') + ')'
    return '(' + code + `)(buffer, ${offsetExpr})`
  }
}

class WriteCompiler extends Compiler {
  constructor () {
    super()

    this.addTypes(conditionalDatatypes.Write)
    this.addTypes(structuresDatatypes.Write)
    this.addTypes(utilsDatatypes.Write)

    // Add default types
    for (const key in numeric) {
      this.addNativeType(key, numeric[key][1])
    }
    for (const key in utils) {
      this.addNativeType(key, utils[key][1])
    }
  }

  compileType (type) {
    if (type instanceof Array) {
      if (this.parameterizableTypes[type[0]]) { return this.parameterizableTypes[type[0]](this, type[1]) }
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.wrapCode('return ' + this.callType('value', type[0], 'offset', Object.values(type[1])))
      }
      throw new Error('Unknown parametrizable type: ' + type[0])
    } else { // Primitive type
      if (type === 'native') return 'null'
      if (this.types[type]) { return 'ctx.' + type }
      return this.primitiveTypes[type]
    }
  }

  wrapCode (code, args = []) {
    if (args.length > 0) return '(value, buffer, offset, ' + args.join(', ') + ') => {\n' + this.indent(code) + '\n}'
    return '(value, buffer, offset) => {\n' + this.indent(code) + '\n}'
  }

  callType (value, type, offsetExpr = 'offset', args = []) {
    if (type instanceof Array) {
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.callType(value, type[0], offsetExpr, Object.values(type[1]))
      }
    }
    if (type instanceof Array && type[0] === 'container') this.scopeStack.push({})
    const code = this.compileType(type)
    if (type instanceof Array && type[0] === 'container') this.scopeStack.pop()
    if (args.length > 0) return '(' + code + `)(${value}, buffer, ${offsetExpr}, ` + args.map(name => this.getField(name)).join(', ') + ')'
    return '(' + code + `)(${value}, buffer, ${offsetExpr})`
  }
}

class SizeOfCompiler extends Compiler {
  constructor () {
    super()

    this.addTypes(conditionalDatatypes.SizeOf)
    this.addTypes(structuresDatatypes.SizeOf)
    this.addTypes(utilsDatatypes.SizeOf)

    // Add default types
    for (const key in numeric) {
      this.addNativeType(key, numeric[key][2])
    }
    for (const key in utils) {
      this.addNativeType(key, utils[key][2])
    }
  }

  /**
   * A native type is a type read or written by a function that will be called in it's
   * original context.
   * @param {*} type
   * @param {*} fn
   */
  addNativeType (type, fn) {
    this.primitiveTypes[type] = `native.${type}`
    if (!isNaN(fn)) {
      this.native[type] = (value) => { return fn }
    } else {
      this.native[type] = fn
    }
    this.types[type] = 'native'
  }

  compileType (type) {
    if (type instanceof Array) {
      if (this.parameterizableTypes[type[0]]) { return this.parameterizableTypes[type[0]](this, type[1]) }
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.wrapCode('return ' + this.callType('value', type[0], Object.values(type[1])))
      }
      throw new Error('Unknown parametrizable type: ' + type[0])
    } else { // Primitive type
      if (type === 'native') return 'null'
      if (!isNaN(this.primitiveTypes[type])) return this.primitiveTypes[type]
      if (this.types[type]) { return 'ctx.' + type }
      return this.primitiveTypes[type]
    }
  }

  wrapCode (code, args = []) {
    if (args.length > 0) return '(value, ' + args.join(', ') + ') => {\n' + this.indent(code) + '\n}'
    return '(value) => {\n' + this.indent(code) + '\n}'
  }

  callType (value, type, args = []) {
    if (type instanceof Array) {
      if (this.types[type[0]] && this.types[type[0]] !== 'native') {
        return this.callType(value, type[0], Object.values(type[1]))
      }
    }
    if (type instanceof Array && type[0] === 'container') this.scopeStack.push({})
    const code = this.compileType(type)
    if (type instanceof Array && type[0] === 'container') this.scopeStack.pop()
    if (!isNaN(code)) return code
    if (args.length > 0) return '(' + code + `)(${value}, ` + args.map(name => this.getField(name)).join(', ') + ')'
    return '(' + code + `)(${value})`
  }
}

module.exports = {
  ReadCompiler,
  WriteCompiler,
  SizeOfCompiler,
  ProtoDefCompiler
}
