function loader (mcVersion) {
  return {
    Recipe: require('./lib/recipe')(mcVersion),
    RecipeItem: require('./lib/recipe_item')
  }
}

module.exports = loader
