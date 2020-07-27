# Block Collision Shapes

Documentation for the block collision shapes data in `blockCollisionShapes.json`.

## Collision Boxes

Collision boxes are the axis-aligned bounding boxes that are checked when colliding entities and blocks.
They can differ from the hitbox, which is the box that is checked when clicking a block.
The full collision shape of a block state can be composed of multiple such boxes, for example stairs or brewing stands.

The way collision boxes are stored/computed has changed with The Flattening.
Until 1.12, a block's collision box also depended on the blocks around it,
e.g., cobblestone walls change their collision box if there's a solid block to N/S/E/W/above.
Starting with 1.13 the colision boxes seem to only depend on the block state itself.

`blockCollisionShapes.json` does not encode any of the neighbor block dependent collision box behavior.
It assumes all surrounding blocks are air, so it is only fully accurate for 1.13 and later.
For 1.12 and earlier, it is accurate for any blocks that don't depend on their neighbors.
For the neighbor dependent blocks it still serves as a better approximation than the previously available "full block"/"empty block" data in `blocks.json`.

## Data Format

The data are split into two collections, as a compromise between file size and consumer implementation simplicity.
`shapes` contains the actual shape coordinates, and `blocks` references these shapes to allow deduplication of data shared by several blocks.

### `blocks`

The `blocks` collection assigns each block (by string id) either an array of shape ids (one per block state)
or, if all block states have the same shape, just specifies that shape id instead of the array.

```js
"blocks":{
"rail":0, // Although not standardized, 0 usually is the "empty" shape (no collision).
"furnace":1, // all furnace states have the shape of id 1 (here: full block)
"oak_slab":[169,169,61,61,1,1], // six block states (upper/lower/double slab and subtypes), referencing the shape ids 169, 61, and 1.
```

### `shapes`

A shape consists of zero or more axis-aligned bounding boxes.
The `shapes` collection assigns each shape id the list of its boxes.

Each box is an array of the block-local coordinates in the order: west, bottom, north, east, top, south;
or x_min, y_min, z_min, x_max, y_max, z_max.
Here block-local means that if the block was at 0,0,0 the box coordinates would match the world coordinates.

Some blocks reach out of the 1x1x1 box, notably fences and piston heads.
The latter can thus have negative coordinate entries.

```js
"shapes":{
"0":[], // Although not standardized, 0 usually is the "empty" shape (no collision).
"1":[[0.0,0.0,0.0,1.0,1.0,1.0]], // full block: single box from (0, 0, 0) to (1, 1, 1)
"61":[[0.0,0.0,0.0,1.0,0.5,1.0]], // lower half slab: from (0, 0, 0) to (1, 0.5, 1)
"110":[[0.0,0.0,0.0,1.0,0.8125,1.0],[0.25,0.8125,0.25,0.75,1.0,0.75]],
// shape 110 (referenced in end_portal_frame) consists of two boxes:
// - the lower part of the block, up to y=0.8125
// - the eye: from y=0.8125 to y=1, from x&z=0.25 to 0.75
```

## Usage Examples

- [Java](https://github.com/Gjum/McDataExtracting/blob/04b573572c/src/main/java/mcextract/BlockCollisionBoxStorage.java)
- [Kotlin](https://github.com/Gjum/Botlin/blob/83a024e76dc76998e04fece55a2454678420c7e7/src/main/kotlin/com/github/gjum/minecraft/botlin/data/BlockInfo.kt#L96-L135)

## Data Source

Because the way that block collision boxes are stored/computed has changed between versions, there are multiple versions of the extraction code:
[1.12.2](https://github.com/Gjum/McDataExtracting/blob/85b564a2c00aa2e88b5b9bd6246f13df39cf215a/src/main/java/mcextract/Main.java#L87-L162),
[1.14.4](https://github.com/Gjum/McDataExtracting/blob/ff8fa51759/src/main/java/mcextract/Main.java#L57-L117),
[1.15](https://github.com/Gjum/McDataExtracting/blob/04b573572c4ccdaedab15383567c98dd63178f97/src/main/java/mcextract/Main.java#L57-L117).

In 1.12.2, the extraction failed for the `end_portal_frame` block, so it was added manually to the JSON file.
