/* eslint-env worker */
import vec3 from 'vec3'
import Convert from 'ansi-to-html'
import { antiXSS } from './../additional/tools.js'
const convert = new Convert()
importScripts('./mineflayer.js')

global.window = self
let bot = null

const emit = (type, ...params) => {
  postMessage({ type, params })
}

addEventListener('message', function (e) {
  const type = e.data.type
  let data = e.data.data
  let block, state
  let inv = ''
  switch (type) {
    case 'init':
      data = data[0]
      console.log(data)
      bot = self.mineflayer.default(null, data.hostname, data.port, {
        host: data.server,
        port: data.serverPort,
        username: data.nick
      })
      bot.heldItem = null
      bot.on('chunkColumnLoad', (p) => {
        const chunk = bot.world.getColumn(p.x / 16, p.z / 16)
        emit(
          'mapChunk',
          chunk.sections,
          chunk.biomes,
          p.x / 16,
          p.z / 16
        )
      })
      bot._client.on('respawn', function (packet) {
        emit('dimension', packet.dimension.value.effects.value)
      })
      bot.on('heldItemChanged', function (item) {
        bot.heldItem = item
      })
      bot.on('login', function () {
        emit('login')
        emit('dimension', bot.game.dimension)
      })
      bot.on('move', function () {
        emit('move', bot.entity.position)
      })
      bot.on('health', function () {
        emit('hp', bot.health)
        emit('food', bot.food)
      })
      bot.on('spawn', function () {
        emit('spawn', bot.entity.yaw, bot.entity.pitch)
      })
      bot.on('kicked', function (reason) {
        emit('kicked', reason)
      })
      bot.on('message', function (msg) {
        const message = antiXSS(msg.toAnsi())
        emit('msg', convert.toHtml(message))
      })
      bot.on('death', () => {
        emit('death')
      })
      bot.on('experience', function () {
        emit('xp', bot.experience)
      })
      bot.on('blockUpdate', function (oldb, newb) {
        emit('blockUpdate', [
          newb.position.x,
          newb.position.y,
          newb.position.z,
          newb.stateId
        ])
      })
      bot.on('diggingCompleted', function (block) {
        emit('diggingCompleted', block)
      })
      bot.on('diggingAborted', function (block) {
        emit('diggingAborted', block)
      })
      bot.on('game', function () {
        emit('game', bot.game)
      })
      setInterval(function () {
        emit('players', bot.players)
        if (bot.inventory !== undefined) {
          const invNew = JSON.stringify(bot.inventory.slots)
          if (inv !== invNew) {
            inv = invNew
            emit('inventory', bot.inventory.slots)
          }
        }
        const entities = {
          mobs: [],
          players: [],
          objects: []
        }
        for (const k in bot.entities) {
          const v = bot.entities[k]
          if (v.type === 'mob') {
            entities.mobs.push([
              v.position.x,
              v.position.y,
              v.position.z
            ])
          } else if (v.type === 'player') {
            entities.players.push([
              v.username,
              v.position.x,
              v.position.y,
              v.position.z
            ])
          } else if (v.type === 'object') {
            entities.objects.push([
              v.position.x,
              v.position.y,
              v.position.z
            ])
          }
        }
        emit('entities', entities)
      }, 10)
      break
    case 'move':
      state = data[0]
      if (state === 'right') {
        state = 'left'
      } else if (state === 'left') {
        state = 'right'
      }
      if (bot.setControlState !== undefined) {
        bot.setControlState(state, data[1])
      }
      break
    case 'rotate':
      bot.look(data[0][0], data[0][1])
      break
    case 'drop':
      if (bot.heldItem !== null) {
        bot.tossStack(bot.heldItem)
      }
      break
    case 'dig':
      block = bot.blockAt(vec3(data[0][0], data[0][1] - 16, data[0][2]))
      if (block !== null) {
        const digTime = bot.digTime(block)
        if (bot.targetDigBlock !== null) {
          // console.log("Already digging...");
          bot.stopDigging()
        }
        emit('digTime', digTime, block)
        // console.log("Start");
        bot.dig(block, false)
      }
      break
    case 'stopDigging':
      bot.stopDigging()
      break
    case 'fly':
      if (data[0]) {
        bot.creative.startFlying()
      } else {
        bot.creative.stopFlying()
      }
      break
    case 'command':
      bot.chat(data[0])
      break
    case 'invc':
      if (bot.inventory !== undefined) {
        const item = bot.inventory.slots[data[0] + 36]
        if (item !== null && item !== undefined) {
          bot.equip(item, 'hand')
        } else if (bot.heldItem !== undefined) {
          bot.unequip('hand')
        }
      }
      break
    case 'blockPlace':
      block = bot.blockAt(vec3(...data[0]))
      if (bot.heldItem !== undefined && bot.heldItem !== null) {
        // console.log(heldItem);
        bot.placeBlock(block, vec3(...data[1]))
      }
      break
  }
})
