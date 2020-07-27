var Recipe = require('./')('1.8').Recipe

console.log(JSON.stringify(Recipe.find(5)[0], null, 2)) // recipes for wood
