## 2.62.1
* fix items 1.16.1

## 2.62.0
* add foods data (thanks @AppDevMichael)

## 2.61.0
* extract proper states + default state from minecraft generator (thanks @Karang)

## 2.60.0
* full 1.16 support (thanks @AppDevMichael)

## 2.59.0
* 1.16.1 protocol support (thanks @Health123)

## 2.58.0
* 1.16 support

## 2.57.0
* fix abilities and recipes packets for 1.16-rc1

## 2.56.0
* add 1.16-rc1 support

## 2.55.0
* entity metadata type is a varint since 1.13

## 2.54.0
* complete items.json files all version (thanks @Karang)

## 2.53.0
* point to other version files for 1.15, 1.15.1, 1.14 and 1.14.1

## 2.52.0
* fix and add block shapes for more versions (thanks @Karang)

## 2.51.0
* more 1.15.2 data (thanks @uncovery)

## 2.50.0
* fix for elyctra (thanks @Mstrodl)
* more 1.14.4 data

## 2.49.0
* fix 1.14.4 blocks (and tests)

## 2.48.0
* fix bounding boxes (@Karang)
* fix some categories (@ImHarvol)

## 2.47.0
* add biomes, blocks, entities, items and recipes for 1.14.4

## 2.46.0
* fix entities for 1.13

## 2.45.0
* fix grass bounding box for 1.13
* last 1.16 snapshots support

## 2.44.0
* small fix to success packet for 20w13b

## 2.43.0
* Provide block collision shapes (thanks @Gjum)
* support snapshot 20w13b of 1.16 (thanks @sbh1311)

## 2.42.0
* Fix mushrooms' bounding boxes (thanks @IdanHo)
* 1.15.2 protocol support

## 2.41.0
* 1.15 protocol support

## 2.40.0
* 1.15.1 protocol support
* various data corrections for blocks (thanks @kemesa7)
* fix stack sizes (thanks @timmyRS)
* add item durability (thanks @timmyRS)

## 2.39.0
* 1.14.4 support

## 2.38.0
* 1.14.3 support

## 2.37.5
* fix intfield -> objectData in spawn_entity in all versions > 1.8

## 2.37.4
* add protocol to 1.14

## 2.37.3
* fix stonecutting in declare_recipes 1.14.1 : only one ingredient

## 2.37.2
* u32 -> i32 in 1.14

## 2.37.1
* add missing version file in 1.14.1 and 1.14

## 2.37.0
* fix redstone
* fix some block properties
* 1.14 support : protocol.json and some of the data : not everything is there yet

## 2.36.0
* fix team prefix and suffix in 1.13

## 2.35.0
* add block state data for 1.13 and 1.13.2

## 2.34.0
* support 1.13.2-pre2 and 1.13.2

## 2.33.0
* fix version definition for 1.13.2-pre1

## 2.32.0
* support 1.13.2-pre1

## 2.31.0
* fix 1.13.1 datapath

## 2.30.0
* update ajv, mocha and standard

## 2.29.0
* full 1.13 and 1.13.1 support (thanks @lluiscab for doing this)

## 2.28.0
* support of 1.13.1 protocol

## 2.27.0
* support of 1.13 protocol

## 2.26.0
* move js tests to standard

## 2.25.0
* fix packet_title starting from 1.11 (see http://wiki.vg/index.php?title=Protocol&oldid=8543#Title)

## 2.24.0
* fix brigadier:string parser properties

## 2.23.0
* some fixes for 17w50a protocol

## 2.22.0
* mcpc 17w50a support (first supported 1.13 snapshot)

## 2.21.0
* mcpc 1.12.2 support

## 2.20.0
* mcpc 1.12.1 support

## 2.19.0
* add language data

## 2.18.0
* mcpc 1.12 : add all the data (in addition to protocol)

## 2.17.0
* mcpc 1.12 support

## 2.16.0
* supports 1.12-pre4

## 2.15.0
* supports 17w18b

## 2.14.0
* supports 17w15a

## 2.13.2
* correct file names

## 2.13.1

* fix id for custom_payload in 1.11.2

## 2.13.0

* protocol_comments -> protocolComments

## 2.12.0

* add protocol comments

## 2.11.0

* add dataPaths file

## 2.10.0

* complete 1.11 data

## 2.9.0

* mcpc 1.11.2 support

## 2.8.0

* mcpe 1.0 support (except the protocol)

## 2.7.0

* 1.11 support (only the protocol)

## 2.6.0

* add classic blocks (thanks @mhsjlw)

## 2.5.0

* add 16w35a
* add enchantments data

## 2.4.0

* fix spelling error in protocol.json (catagory)
* add mcpe 0.15 protocol, blocks and items and update mcpe versions file
* add mcpc 1.10.1 and 1.10.2 and update mcpc versions file

## 2.3.1

* fix 1.10 version

## 2.3.0

* add 1.10 data

## 2.2.0

 * add license
 * add pe protocol

## 2.1.0

 * add 1.10-pre1

## 2.0.0

 * fix minecraftVersion in 16w20a
 * add a regex to validate the version strings
 * add pe blocks.json and items.json
 * BREAKING : move all pc data to pc dir

## 1.1.0

 * add 1.10 support (16w20a)

## 1.0.0

 * lot of minecraft version added
 * improve entities.json
 * add windows.json
 * other improvements : see commits log

## 1.8-0.1.0
 * first version after the versions split
 * move js files to tools/js
 * use countType in protocol.json

## 0.4.0
 * add some basic (to be used for manual updating) protocol extractors
 * import protocol.json from node-minecraft-protocol for version 1.8 of minecraft

## 0.3.0
 * remove id indexing from biomes, blocks, entities, items and instruments : let users (for examples node-minecraft-data) provide their indexing (by id, name,...)

## 0.2.1
 * entities is now in the API

## 0.2.0
 * update blocks, entities, items and recipes enums with new wiki extractors
 * add entities displayName
 * add drops in blocks
 * add metadata variations in blocks and drops
 * update recipes with variations of blocks and items
 * amount -> count and meta -> metadata in recipes
 * reorganize and improve wiki extractors

## 0.1.1
 * some new wiki extractors : beginning of work for blocks, entities
 * fix some recipes
 * add entities.json file

## 0.1.0
 * add json schemas to check the enums schemas
 * use circle ci the check the enums schemas automatically
 * add docson documentation for the schemas
 * change the format of recipes
 * add doc/recipes.md

## 0.0.1

 * first version
 * enums in enums/
 * scripts to audit and generate the enums in bin/
 * support minecraft 1.8 with some missing data
