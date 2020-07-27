# History

## 1.8.2

* fixed aliases in compiler for write and size (thanks @Karang)

## 1.8.1

* fixed to aliases in compiler (thanks @Karang)

## 1.8.0

* add option not to log partial packets in full chunk parser

## 1.7.2

* remove closure compiler

## 1.7.1

* fix option in compiler

## 1.7.0

* Add js compiler protodef implementation, that is 10x faster (thanks @Karang for this huge improvement !)

## 1.6.10

* include .json files with the suffix

## 1.6.9

* use standard style

## 1.6.8

* update deps

## 1.6.7

* stringify packet data before displaying it for an error of wrong length for fullpacketserializer

## 1.6.6

* fix release

## 1.6.5

* fix fullpacketparser error emission in case of partial packet

## 1.6.4

* improve fullpacketparser error

## 1.6.3

* fix fullpacketparser error

## 1.6.2

* improve fullpacketparser error

## 1.6.1

* fix FullPacketParser hiding errors

## 1.6.0

* add full packet parser

## 1.5.1

* fix optional validation

## 1.5.0

* validation is now optional (opt-out)

## 1.4.0

* implement aliases

## 1.3.1

* fix countType : now behave as an ordinary type, remove undocumented countTypeArgs

## 1.3.0

* validate types against type schemas using the protodef validator

## 1.2.3

* fix sendCount : write return the offset, not the size, add a test for this

## 1.2.2

* stop swallowing errors in parser and serializer

## 1.2.1

* add li8, lu8 and u64, lu64 for consistency

## 1.2.0

* all datatypes are tested
* fix cstring
* fix PartialReadError in i64
* remove special count
* use protodef spec
* add little endian numerical types

## 1.1.2

* allow hex values in mappings

## 1.1.1

* update some more dependencies

## 1.1.0

* update to babel6, remove some dependencies

## 1.0.3

* fix slice the buffer in parsePacketBuffer

## 1.0.2

* slice the buffer in parsePacketBuffer

## 1.0.1

* let the parser error out without crashing on errors

## 1.0.0

* change the name of numerical types
* add doc


## 0.3.0

* add partial packet support

## 0.2.6

* add compareToValue (optional) option to switch

## 0.2.5

* fix small error in switch

## 0.2.4

* get back the example file as one file for simplicity and for tonic

## 0.2.3

* fix a small mistake in mapping error
* improve internal code
* improve example
* integrate with tonicdev

## 0.2.2

* Fix writeOption : the offset wasn't properly updated

## 0.2.1

* Anon fields may now be null/undefined.

## 0.2.0

* add createPacketBuffer and parsePacketBuffer to ProtoDef class
* expose utils functions
* add mapper and pstring datatypes

## 0.1.0

* add the serializer and parser
* expose the default datatypes
* add an example

## 0.0.1

* basic version, mostly contain the ProtoDef class and the datatype
