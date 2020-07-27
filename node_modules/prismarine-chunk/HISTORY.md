## History

## 1.20.1

* Return air when reading y < 0 or y >= 256

## 1.20.0

* 1.16 support

## 1.19.0

* setBlockData for 1.13, 1.14, 1.15 (thanks @Deudly)

## 1.18.1

* fix bitwise unsigned operators => fix dumping chunks for 1.9->1.12

## 1.18.0

* reimplement 1.9->1.12 in a similar way to 1.13 (remove protodef dependency)
* implement full chunk for 1.8
* add empty load and dump biomes and light methods for simplicity in all versions

## 1.17.0

* support for full chunk property (thanks @Karang)
* fix bug in json serialization

## 1.16.0

* support for 1.15 chunk (thanks @Karang)

## 1.15.0

* support for 1.14 chunk (thanks @Karang)

## 1.14.0

* faster 1.13 chunk implementation (thanks @Karang)

## 1.13.0

* fast json serialization/parsing for out of process loading/writing

## 1.12.0

* 1.13 support (thanks @hornta)

## 1.11.1

* fix dumping for noSkylight chunks for 1.9-1.12 (thanks @IdanHo)

## 1.11.0

* add chunk handling for chunks without skylight data in 1.8 (thanks @skullteria)

## 1.10.0

* support 1.13
* better tests

## 1.9.1

* standardjs
* circleci 2
* better no chunk implementation exception

## 1.9.0

* small 1.9 fix (thanks @Flynnn)
* handle skylightsent in 1.8

## 1.8.2

* fix initialize in 1.8 + test

### 1.8.1

* fix initialize in 1.8

### 1.8.0

* optimization of 1.9 chunk done by @allain

### 1.7.0

* supports mcpc 1.12 (same as 1.9)

### 1.6.0

* add skyLightSent to load

### 1.5.1

* use last protodef, fix longToByte (no countTypeArgs), and remove gulp

### 1.5.0

* supports mcpc 1.10 and 1.11 (same as 1.9)

### 1.4.0

* supports mcpc 1.9 (thanks @Flynnn)

### 1.3.0

* supports bitmap in load and dump in 1.8, default to bitmap == 0xFFFF

### 1.2.0

* support MCPE 1.0 chunks

### 1.1.0

* support MCPE 0.14 chunks

### 1.0.1

* update to babel6

### 1.0.0

* bump dependencies

### 0.3.2

* simplify and fix initialize

### 0.3.1

* fix iniPos in initialize

### 0.3.0

* add Chunk.initialize, useful for fast generation

### 0.2.1

 * fix the badge

### 0.2.0

 * use vec3
 * add an example + doc
 * use prismarine-block

### 0.1.0

* First version, basic functionality
