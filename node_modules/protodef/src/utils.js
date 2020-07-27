function getField (countField, context) {
  const countFieldArr = countField.split('/')
  let i = 0
  if (countFieldArr[i] === '') {
    while (context.hasOwnProperty('..')) { context = context['..'] }
    i++
  }
  for (; i < countFieldArr.length; i++) { context = context[countFieldArr[i]] }
  return context
}

function getFieldInfo (fieldInfo) {
  if (typeof fieldInfo === 'string') { return { type: fieldInfo } } else if (Array.isArray(fieldInfo)) { return { type: fieldInfo[0], typeArgs: fieldInfo[1] } } else if (typeof fieldInfo.type === 'string') { return fieldInfo } else { throw new Error('Not a fieldinfo') }
}

function getCount (buffer, offset, { count, countType }, rootNode) {
  let c = 0
  let size = 0
  if (typeof count === 'number') { c = count } else if (typeof count !== 'undefined') {
    c = getField(count, rootNode)
  } else if (typeof countType !== 'undefined') {
    ({ size, value: c } = tryDoc(() => this.read(buffer, offset, getFieldInfo(countType), rootNode), '$count'))
  } else { // TODO : broken schema, should probably error out.
    c = 0
  }
  return { count: c, size }
}

function sendCount (len, buffer, offset, { count, countType }, rootNode) {
  if (typeof count !== 'undefined' && len !== count) {
    // TODO: Throw
  } else if (typeof countType !== 'undefined') {
    offset = this.write(len, buffer, offset, getFieldInfo(countType), rootNode)
  } else {
    // TODO: Throw
  }
  return offset
}

function calcCount (len, { count, countType }, rootNode) {
  if (typeof count === 'undefined' && typeof countType !== 'undefined') { return tryDoc(() => this.sizeOf(len, getFieldInfo(countType), rootNode), '$count') } else { return 0 }
}

function addErrorField (e, field) {
  e.field = e.field ? field + '.' + e.field : field
  throw e
}

function tryCatch (tryfn, catchfn) {
  try { return tryfn() } catch (e) { catchfn(e) }
}

function tryDoc (tryfn, field) {
  return tryCatch(tryfn, (e) => addErrorField(e, field))
}

class ExtendableError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    if (Error.captureStackTrace != null) {
      Error.captureStackTrace(this, this.constructor.name)
    }
  }
}

class PartialReadError extends ExtendableError {
  constructor (message) {
    super(message)
    this.partialReadError = true
  }
}

module.exports = {
  getField: getField,
  getFieldInfo: getFieldInfo,
  addErrorField: addErrorField,
  getCount: getCount,
  sendCount: sendCount,
  calcCount: calcCount,
  tryCatch: tryCatch,
  tryDoc: tryDoc,
  PartialReadError: PartialReadError
}
