# minecraft-data 

[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Build Status](https://circleci.com/gh/PrismarineJS/minecraft-data/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/minecraft-data/tree/master)

Language independent module providing minecraft data for minecraft clients, servers and libraries.

Supports 
* Minecraft PC version 0.30c (classic), 1.7.10, 1.8.8, 1.9 (15w40b, 1.9, 1.9.1-pre2, 1.9.2, 1.9.4),
 1.10 (16w20a, 1.10-pre1, 1.10, 1.10.1, 1.10.2), 1.11 (16w35a, 1.11, 1.11.2), 1.12 (17w15a, 17w18b, 1.12-pre4, 1.12, 1.12.1, 1.12.2), 1.13 (17w50a, 1.13, 1.13.1, 1.13.2-pre1, 1.13.2-pre2, 1.13.2), 1.14 (1.14, 1.14.1, 1.14.3, 1.14.4), 1.15 (1.15, 1.15.1, 1.15.2) and 1.16 (20w13b, 20w14a, 1.16-rc1, 1.16, 1.16.1)
* Minecraft PE version 0.14, 0.15 and 1.0

## Wrappers

Minecraft-data is language independent, you can use it with these language specific modules :

| Wrapper name | Language | Data provided |
| --- | --- | --- |
| [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data) | Node.js | everything |
| [python-minecraft-data](https://github.com/SpockBotMC/python-minecraft-data) | python | everything |
| [McData](https://github.com/McEx/McData) | Elixir | protocol |
| [ProtocolGen](https://github.com/Johni0702/ProtocolGen) | java | generated java files from protocol.json to read and write minecraft packets |

If you want to use minecraft-data in a new language, we advise you to [create a new wrapper](doc/make-a-new-wrapper.md)

## Data

Data provided:

| Data | Description |
| --- | --- |
| Biomes | |
| Blocks |  |
| Enchantment | |
| Effect | Status/Potion effects |
| Entities | |
| Language | language code and their english strings |
| Instruments | sounds emitted by blocks |
| Items |  |
| Materials | to be used with blocks data. Provides tool speed multipliers against material types. |
| Protocol | a complete description of the protocol, can be used to automatically implement the protocol |
| Protocol Versions | the whole list of minecraft protocol versions |
| Recipes | to be used with blocks and items data |
| Windows | the different kind of windows and their characteristics |
| Version | |
| Versions | all the versions supported in minecraft-data |
| Block collison shapes | |
| Foods | list of foods each with there id, saturation, foodpoints and more |

See more information about this data in the [documentation](http://prismarinejs.github.io/minecraft-data/)

## Documentation

 * See [doc/history.md](doc/history.md)
 * [Documentation generated using the json schemas and docson](http://prismarinejs.github.io/minecraft-data)
 * [Textual documentation of the recipe format](doc/recipes.md)
  
## Projects using minecraft-data

These are the projects that use minecraft-data:

| Project name | Language | Project type | Data used |
| --- | --- | --- | --- |
| [mineflayer](https://github.com/PrismarineJS/mineflayer) | Node.js | bot library | biomes, blocks, entities, instruments, items, materials, recipes |
| [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | Node.js | protocol serialization | protocol |
| [flying-squid](https://github.com/PrismarineJS/flying-squid) | Node.js | server library | biomes, blocks, materials |
| [SpockBot](https://github.com/SpockBotMC/SpockBot) | Python | bot library | biomes, blocks, items, materials, windows, recipes |
| [PhaseBot](https://github.com/phase/PhaseBot) | Java | bot | blocks, items, materials |
| [McEx](https://github.com/hansihe/McEx) | Elixir | server | blocks |
| [VoxelGamesLib](https://github.com/MiniDigger/VoxelGamesLib) | Java | minigames server library | blocks, items | 
| [Phpcraft](https://github.com/Phpcraft/core) | PHP | all-around library | blocks, items, entities, protocol | 

## Extraction

Projects that provide data:

| Project name | Language | Source | Data provided |
| --- | --- | --- | --- |
| [minecraft-wiki-extractor](https://github.com/PrismarineJS/minecraft-wiki-extractor) | Node.js | [minecraft wiki](http://minecraft.gamepedia.com/Minecraft_Wiki) | blocks, items, entities, recipes |
| [mcdevs-wiki-extractor](https://github.com/PrismarineJS/mcdevs-wiki-extractor) | Node.js | [wiki.vg](http://wiki.vg/Protocol) | a partial protocol, entities |
| [node-minecraft-extractor](https://github.com/PrismarineJS/node-minecraft-extractor) | Node.js | merge between wiki.vg and mcwiki | a complete entities file |
| [minecraft-jar-extractor](https://github.com/PrismarineJS/minecraft-jar-extractor) | Node.js | minecraft server jar | a very partial but completely up to date protocol |
| [minecraft-jar-extractor in python](https://github.com/pangeacake/minecraft-jar-extractor) | Python | minecraft server jar | about the same protocol information as minecraft-jar-extractor in node.js |
| [burger](https://github.com/mcdevs/Burger) with [burger-extractor](https://github.com/PrismarineJS/burger-extractor) | Node.js | minecraft server jar | used to provide items, blocks, biomes and recipes |
[burger 1.16](https://github.com/Pokechu22/Burger/tree/1.16-dev)

Pages interesting to manually update the data if necessary:

| Page | Data |
| ---- | ---- |
| [wiki.vg Inventory page](http://wiki.vg/Inventory) | windows |
| [wiki.vg](http://wiki.vg/Block_Actions) | instruments |
| [a mineflayer PR](https://github.com/PrismarineJS/mineflayer/pull/197) | biomes |
| [mcwiki effects page](http://minecraft.gamepedia.com/Status_effect) | effects |
| [wiki.vg protocol version numbers](http://wiki.vg/Protocol_version_numbers) | protocolVersions |

## Data quality

Minecraft data provides scripts to audit the data, they can be useful to check the data is correct :

 * [audit_blocks](tools/js/test/audit_blocks.js)
 * [audit_items](tools/js/test/audit_items.js)
 * [audit_recipes](tools/js/test/audit_recipes.js)
 * [audit_shapes](tools/js/test/audit_shapes.js)
 
Minecraft data also provides json schemas in enums_schemas/ that are used in 
test/test.js to check the json file are valid relative to these schemas.
These schemas can also be used to understand better how the json files are
formatted in order to use it.

## Contribute

Please read https://github.com/PrismarineJS/prismarine-contribute

## License

MIT

Some of the data was extracted manually or automatically from wiki.vg and minecraft.gamepedia.com.
If required by one of the sources the license might change to something more appropriate.

## Related project

[minecraft-assets](https://github.com/rom1504/minecraft-assets) which provide minecraft assets along with json files that help to use them.
