import {
  MeshStandardMaterial,
  Color,
  BoxGeometry,
  InstancedMesh,
  DynamicDrawUsage,
  Object3D
} from 'three'

class Entities {
  constructor (game) {
    this.game = game

    this.mobMaterial = new MeshStandardMaterial({
      color: new Color('red')
    })
    this.mobGeometry = new BoxGeometry(1, 1, 1)
    this.mobMaxCount = 1000
    this.mobMesh = new InstancedMesh(
      this.mobGeometry,
      this.mobMaterial,
      this.mobMaxCount
    )
    this.mobMesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.game.scene.add(this.mobMesh)

    this.playerMaterial = new MeshStandardMaterial({
      color: new Color('blue')
    })
    this.playerGeometry = new BoxGeometry(1, 1, 1)
    this.playerMaxCount = 1000
    this.playerMesh = new InstancedMesh(
      this.playerGeometry,
      this.playerMaterial,
      this.playerMaxCount
    )
    this.playerMesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.game.scene.add(this.playerMesh)

    this.objectMaterial = new MeshStandardMaterial({
      color: new Color('green')
    })
    this.objectGeometry = new BoxGeometry(0.25, 0.25, 0.25)
    this.objectMaxCount = 1000
    this.objectMesh = new InstancedMesh(
      this.objectGeometry,
      this.objectMaterial,
      this.objectMaxCount
    )
    this.objectMesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.game.scene.add(this.objectMesh)

    this.dummy = new Object3D()
  }

  update (entities) {
    const offset = [-0.5, 16, -0.5]
    let numMobs = 0
    this.mobMesh.count = entities.mobs.length
    for (const i in entities.mobs) {
      this.dummy.position.set(
        entities.mobs[i][0] + offset[0],
        entities.mobs[i][1] + offset[1],
        entities.mobs[i][2] + offset[2]
      )
      this.dummy.updateMatrix()
      this.mobMesh.setMatrixAt(numMobs++, this.dummy.matrix)
    }
    this.mobMesh.instanceMatrix.needsUpdate = true

    let numObjects = 0
    this.objectMesh.count = entities.objects.length
    for (const i in entities.objects) {
      this.dummy.position.set(
        entities.objects[i][0] + offset[0],
        entities.objects[i][1] + offset[1],
        entities.objects[i][2] + offset[2]
      )
      this.dummy.updateMatrix()
      this.objectMesh.setMatrixAt(numObjects++, this.dummy.matrix)
    }
    this.objectMesh.instanceMatrix.needsUpdate = true

    let numPlayers = 0
    for (const i in entities.players) {
      if (entities.players[i][0] !== this.game.nick) {
        numPlayers++
      }
    }
    this.playerMesh.count = numPlayers
    numPlayers = 0
    for (const i in entities.players) {
      if (entities.players[i][0] !== this.game.nick) {
        this.dummy.position.set(
          entities.players[i][1] + offset[0],
          entities.players[i][2] + offset[1],
          entities.players[i][3] + offset[2]
        )
        this.dummy.updateMatrix()
        this.playerMesh.setMatrixAt(numPlayers++, this.dummy.matrix)
      }
    }
    this.playerMesh.instanceMatrix.needsUpdate = true
  }
}

export { Entities }
