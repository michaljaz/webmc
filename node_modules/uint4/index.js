var readUInt4BE = function(buffer, cursor) {
    if(cursor % 1)
        return buffer.readUInt8(Math.floor(cursor)) & 15;
    else
        return buffer.readUInt8(cursor) >> 4;
};

var writeUInt4BE = function(buffer, value, cursor) {
    if(value >= 16)
        throw(new Error('value is out of bounds'));

    var byteLoc = Math.floor(cursor);
    if(cursor % 1) // Second half byte
        buffer.writeUInt8((readUInt4BE(buffer, byteLoc) << 4 | value), byteLoc);
    else // First half byte
        buffer.writeUInt8((value << 4 | readUInt4BE(buffer, cursor)),  byteLoc);
};

var readUInt4LE = function(buffer, cursor) {
    if(cursor % 1)
        return buffer.readUInt8(Math.floor(cursor)) >> 4;
    else
        return buffer.readUInt8(cursor) & 15;
};

var writeUInt4LE = function(buffer, value, cursor) {
    if(value >= 16)
        throw(new Error('value is out of bounds'));

    var byteLoc = Math.floor(cursor);
    if(cursor % 1)
        buffer.writeUInt8((value << 4 | readUInt4LE(buffer, Math.floor(cursor))),  byteLoc);
    else
        buffer.writeUInt8((readUInt4LE(buffer, byteLoc) << 4 | value), byteLoc);
};

module.exports.read       = readUInt4BE;
module.exports.readUInt4  = readUInt4BE;
module.exports.write      = writeUInt4BE;
module.exports.writeUInt4 = writeUInt4BE;
module.exports.readUInt4BE  = readUInt4BE;
module.exports.writeUInt4BE = writeUInt4BE;
module.exports.readUInt4LE  = readUInt4LE;
module.exports.writeUInt4LE = writeUInt4LE;
