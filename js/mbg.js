/**
 * Combine indexed and non-indexed BufferGeometry into a new indexed BufferGeometry. All missing uniforms are set to 0.
 * @param {array} geometries Array of THREE.BufferGeometry instances
 * @returns {BufferGeometry}
 */
function mergeBufferGeometries (geometries) {
    var indexLength = 0,
        verticesLength = 0,
        attributesInfos = {},
        geometriesInfos = [],
        geometryInfo,
        referenceAttributesKeys = [],
        attributesKeys,
        countVertices,
        i,
        j,
        k;

    // read the geometries and attributes information, calculate indexLength and verticesLength

    for (i = 0; i < geometries.length; i++) {
        attributesKeys = Object.keys(geometries[i].attributes);

        geometryInfo = {
            indexed: geometries[i].index !== null,
            vertices: geometries[i].attributes[attributesKeys[0]].count
        };

        geometriesInfos.push(geometryInfo);

        if (geometryInfo.indexed) {
            indexLength += geometries[i].index.count;
        } else {
            indexLength += geometryInfo.vertices;
        }

        verticesLength += geometryInfo.vertices;

        for (j = 0; j < attributesKeys.length; j++) {
            if (referenceAttributesKeys.indexOf(attributesKeys[j]) === -1) {
                referenceAttributesKeys.push(attributesKeys[j]);

                attributesInfos[attributesKeys[j]] = {
                    array: null,
                    constructor: geometries[i].attributes[attributesKeys[j]].array.constructor,
                    itemSize: geometries[i].attributes[attributesKeys[j]].itemSize
                };
            }
        }
    }

    // prepare the new BufferGeometry and its attributes

    var newGeometry = new THREE.BufferGeometry(),
        indexArray = verticesLength > 0xFFFF ? new Uint32Array(indexLength) : new Uint16Array(indexLength);

    for (i = 0; i < referenceAttributesKeys.length; i++) {
        attributesInfos[referenceAttributesKeys[i]].array = new (attributesInfos[referenceAttributesKeys[i]].constructor)(
            verticesLength * attributesInfos[referenceAttributesKeys[i]].itemSize
        );

        newGeometry.addAttribute(referenceAttributesKeys[i], new THREE.BufferAttribute(
            attributesInfos[referenceAttributesKeys[i]].array,
            attributesInfos[referenceAttributesKeys[i]].itemSize
        ));
    }

    // copy all the data in the new BufferGeometry

    var offsetIndices = 0,
        offsetVertices = 0,
        offsetAttribute;

    for (i = 0; i < geometries.length; i++) {

        geometryInfo = geometriesInfos[i];

        if (geometryInfo.indexed) {
            for (j = 0; j < geometries[i].index.count; j++) {
                indexArray[offsetIndices + j] = offsetVertices + geometries[i].index.array[j];
            }

            offsetIndices += geometries[i].index.count;
        } else {
            for (j = 0; j < geometryInfo.vertices; j++) {
                indexArray[offsetIndices + j] = offsetVertices + j;
            }

            offsetIndices += geometryInfo.vertices;
        }

        for (j = 0; j < referenceAttributesKeys.length; j++) {
            offsetAttribute = offsetVertices * attributesInfos[referenceAttributesKeys[j]].itemSize;

            if (geometries[i].attributes[referenceAttributesKeys[j]]) {
                attributesInfos[referenceAttributesKeys[j]].array.set(geometries[i].attributes[referenceAttributesKeys[j]].array, offsetAttribute);
            }
        }

        offsetVertices += geometryInfo.vertices;
    }

    newGeometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

    return newGeometry;
}