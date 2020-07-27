const re = /\((-?[.\d]+), (-?[.\d]+), (-?[.\d]+)\)/

class Vec3 {
  constructor (x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  set (x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  update (other) {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    return this
  }

  floored () {
    return new Vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z))
  }

  floor () {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)
    this.z = Math.floor(this.z)
    return this
  }

  offset (dx, dy, dz) {
    return new Vec3(this.x + dx, this.y + dy, this.z + dz)
  }

  translate (dx, dy, dz) {
    this.x += dx
    this.y += dy
    this.z += dz
    return this
  }

  add (other) {
    this.x += other.x
    this.y += other.y
    this.z += other.z
    return this
  }

  subtract (other) {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z
    return this
  }

  plus (other) {
    return this.offset(other.x, other.y, other.z)
  }

  minus (other) {
    return this.offset(-other.x, -other.y, -other.z)
  }

  scaled (scalar) {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  abs () {
    return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
  }

  volume () {
    return this.x * this.y * this.z
  }

  modulus (other) {
    return new Vec3(
      euclideanMod(this.x, other.x),
      euclideanMod(this.y, other.y),
      euclideanMod(this.z, other.z))
  }

  distanceTo (other) {
    var dx = other.x - this.x
    var dy = other.y - this.y
    var dz = other.z - this.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  distanceSquared (other) {
    var dx = other.x - this.x
    var dy = other.y - this.y
    var dz = other.z - this.z
    return dx * dx + dy * dy + dz * dz
  }

  equals (other) {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  toString () {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ')'
  }

  clone () {
    return this.offset(0, 0, 0)
  }

  min (other) {
    return new Vec3(Math.min(this.x, other.x), Math.min(this.y, other.y), Math.min(this.z, other.z))
  }

  max (other) {
    return new Vec3(Math.max(this.x, other.x), Math.max(this.y, other.y), Math.max(this.z, other.z))
  }

  norm () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  dot (other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  cross (other) {
    return new Vec3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x)
  }

  unit () {
    const norm = this.norm()
    if (norm === 0) {
      return this.clone()
    } else {
      return this.scaled(1 / norm)
    }
  }

  normalize () {
    const norm = this.norm()
    if (norm !== 0) {
      this.x /= norm
      this.y /= norm
      this.z /= norm
    }
    return this
  }

  scale (scalar) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar
    return this
  }

  xyDistanceTo (other) {
    var dx = other.x - this.x
    var dy = other.y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  xzDistanceTo (other) {
    var dx = other.x - this.x
    var dz = other.z - this.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  yzDistanceTo (other) {
    var dy = other.y - this.y
    var dz = other.z - this.z
    return Math.sqrt(dy * dy + dz * dz)
  }

  innerProduct (other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  manhattanDistanceTo (other) {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y) + Math.abs(other.z - this.z)
  }

  toArray () {
    return [this.x, this.y, this.z]
  }
}

function v (x, y, z) {
  if (x == null) {
    return new Vec3(0, 0, 0)
  } else if (Array.isArray(x)) {
    return new Vec3(parseFloat(x[0], 10), parseFloat(x[1], 10), parseFloat(x[2], 10))
  } else if (typeof x === 'object') {
    return new Vec3(parseFloat(x.x, 10), parseFloat(x.y, 10), parseFloat(x.z, 10))
  } else if (typeof x === 'string' && y == null) {
    var match = x.match(re)
    if (match) {
      return new Vec3(
        parseFloat(match[1], 10),
        parseFloat(match[2], 10),
        parseFloat(match[3], 10))
    } else {
      throw new Error('vec3: cannot parse: ' + x)
    }
  } else {
    return new Vec3(parseFloat(x, 10), parseFloat(y, 10), parseFloat(z, 10))
  }
}

function euclideanMod (numerator, denominator) {
  var result = numerator % denominator
  return result < 0 ? result + denominator : result
}

module.exports = v
v.Vec3 = Vec3
