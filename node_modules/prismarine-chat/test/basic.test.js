/* eslint-env jest */
const ChatMessage = require('../')('1.16')
test('Parsing a chat message', () => {
  const msg = new ChatMessage({ text: 'Example chat message' })
  expect(msg.toString()).toBe('Example chat message')
})
