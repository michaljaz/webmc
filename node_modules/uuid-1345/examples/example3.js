var UUID = require('../index');

var uuid = new UUID('39888f87-fb62-5988-a425-b2ea63f5b81e');
console.log( uuid.version    );
console.log( uuid.variant    );
console.log( uuid.toString() );
console.log( uuid.toBuffer() );

