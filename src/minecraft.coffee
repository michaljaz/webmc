
mcServer = require 'flying-squid'

config=require "#{__dirname}/server.json"

mcServer.createMCServer {
  'motd': 'Web-minecraft lite server'
  'port': config.port
  'max-players': 10
  'online-mode': false
  'gameMode': 1
  'difficulty': 1
  'worldFolder':"#{__dirname}/world"
  'generation': {
    'name': 'diamond_square'
    'options':{
      'worldHeight': 80
    }
  }
  'kickTimeout': 10000
  'plugins': {

  }
  'modpe': false
  'view-distance': 10
  'player-list-text': {
    'header':'Flying squid'
    'footer':'Test server'
  }
  'everybody-op': true
  'max-entities': 100
  'version': config.version
}