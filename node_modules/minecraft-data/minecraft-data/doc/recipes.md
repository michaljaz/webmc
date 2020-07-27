# Recipes
Documentation for the recipes json schema

### Items

An item can be represented different ways.

A single **numerical ID** or `null`.
**Examples:**
- `1` for any item with ID `1`
- `null` for empty

A **list** of `id` and `metadata`.
This is preferred if there are many items at once, e.g. in a shape.
**Example:** `[1, 2]` for any count of Polished Granite

A **dictionary** of at least `id`, optionally `metadata` and `count`.
This is preferred if there are not many items at once, e.g. `result` in a recipe.
**Examples:**
- `{"id": 1}` for any item with ID `1`
- `{"id": 1, "metadata": 3}` for any count of Diorite
- `{"id": 1, "metadata": 2, "count": 4}` for 4 Polished Granite

### Shapes

A shape is a list of rows, which are lists of items.
There must be at least one row with at least one item in it.
All rows must have the same length.
Empty rows at the beginning or end of a shape may be omitted.
Empty colums at the end may also be omitted.
When an item can be crafted in a 2x2 grid, the shape may not be larger than 2x2.

**Examples:**

Stick:

	[
		[5],
		[5]
	]
	or
	[
		[5, null],
		[5, null]
	]

Stonebricks:

	[
		[1, 1],
		[1, 1]
	]

Polished Granite:

	[
		[[1,1], [1,1]],
		[[1,1], [1,1]]
	]
	or
	[
		[{"id": 1, "metadata": 1}, {"id": 1, "metadata": 1}],
		[{"id": 1, "metadata": 1}, {"id": 1, "metadata": 1}]
	]

### Recipes

A shaped recipe is a dictionary of `result`, `inShape` and optionally `outShape`.
A shapeless recipe is a dictionary of `result` and `ingredients`.
`inShape` and `outShape` are shapes, as specified [above](#Shapes).
`ingredients` is a list of items.
`result` is a single item.
Items may be in any of the representations [above](#Items).
`outShape` must be of the same dimensions as `inShape`.

### File format

The file is in JSON format.
At the top level is a dictionary of quoted numerical item IDs.
Each ID maps to a list of recipes.
There may be multiple different recipes per item (same ID and metadata).
The recipes may not be sorted.

**Example:**

```js
{
	"1": [
		{ // Polished Granite
			"result": {"id": 1, "metadata": 2, "count": 4},
			"inShape": [
				[[1,1], [1,1]],
				[[1,1], [1,1]]
			]
		},
		{ // Polished Diorite
			"result": {"id": 1, "metadata": 4, "count": 4},
			"inShape": [
				[[1,3], [1,3]],
				[[1,3], [1,3]]
			]
		}
	],
	"5": [
		{
			"result": {"id": 5, "metadata": -1, "count": 4},
			"inShape": [
				[17]
			]
		}
	],
	"280": [
		{
			"result": {"id": 280, "metadata": -1, "count": 4},
			"inShape": [
				[5],
				[5]
			]
		}
	],
	"354": [ // cake
		{
			"result": 354,
			"inShape": [
				[335, 335, 335],
				[353, 344, 353],
				[296, 296, 296]
			],
			"outShape": [
				[ 325,  325,  325],
				[null, null, null],
				[null, null, null]
			]
		}
	],
	"378": [ // magma cream
		{
			"result": 378,
			"ingredients": [341, 377]
		}
	]
}
```

## Example implementations

- [Python](https://gist.github.com/Gjum/9c0491aad1c8ec8d6f38#file-recipe-py)

## Json schema
The [json schema](https://github.com/PrismarineJS/minecraft-data/blob/master/enums_schemas/recipes_schema.json) automatically
checks whether the recipes.json respects that format, see the [visualization](http://prismarinejs.github.io/minecraft-data/) here.