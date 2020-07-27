exports.clamp = function clamp (min, x, max) {
  return Math.max(min, Math.min(x, max))
}
