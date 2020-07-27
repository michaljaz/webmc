# prismarine-recipe

[![Build Status](https://circleci.com/gh/PrismarineJS/prismarine-recipe/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/prismarine-recipe/tree/master)

Represent minecraft recipes

## Usage

```js
const Recipe=require("prismarine-recipe")("1.8").Recipe;

console.log(JSON.stringify(Recipe.find(5)[0],null,2)); // recipes for wood
```

## API

### Recipe

#### Recipe.find(itemType, [metadata])

Returns a list of matching `Recipe` instances.

 * `itemType` - numerical id
 * `metadata` - metadata to match. `null` means match anything.

#### recipe.result

The output item. It's a recipeItem :
```js
{
  id:45,
  metadata:3,
  count:1
}
```

#### recipe.inShape

Looks like this:

```js
[
  [recipeItem, recipeItem],
  [recipeItem, recipeItem],
  [recipeItem, recipeItem],
]
```

#### recipe.outShape

Looks the same as `inShape`. Only relevant for cake.

#### recipe.ingredients

List of shape-independent ingredients. Looks like this:

```js
[
  recipeItem,
  recipeItem
]
```

#### recipe.requiresTable

Boolean.

#### recipe.delta

Map of item type to how much more or less you will have after you use
the recipe.

This is what it looks like for the chest recipe:

```js
[
  recipeItem,
  recipeItem
]
```

## History

### 1.1.0

* typescript definitions (thanks @IdanHo)

### 1.0.1

* bump mcdata

### 1.0.0

* bump dependencies

### 0.0.0

* Import from mineflayer