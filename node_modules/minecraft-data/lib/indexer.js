module.exports = {
  buildIndexFromObject:
    function (object, fieldToIndex) {
      if (object === undefined) { return undefined }
      return Object.keys(object).reduce(function (index, key) {
        index[object[key][fieldToIndex]] = object[key]
        return index
      }, {})
    },
  buildIndexFromArray:
    function (array, fieldToIndex) {
      if (array === undefined) { return undefined }
      return array.reduce(function (index, element) {
        index[element[fieldToIndex]] = element
        return index
      }, {})
    },
  buildIndexFromArrayNonUnique:
    function (array, fieldToIndex) {
      if (array === undefined) { return undefined }
      return array.reduce(function (index, element) {
        if (!index[element[fieldToIndex]]) { index[element[fieldToIndex]] = [] }
        index[element[fieldToIndex]].push(element)
        return index
      }, {})
    },
  buildIndexFromArrayWithRanges:
    function (array, fieldToIndexMin, fieldToIndexMax) {
      if (array === undefined) { return undefined }
      return array.reduce(function (index, element) {
        for (let i = element[fieldToIndexMin]; i <= element[fieldToIndexMax]; i++) {
          index[i] = element
        }
        return index
      }, {})
    }
}
