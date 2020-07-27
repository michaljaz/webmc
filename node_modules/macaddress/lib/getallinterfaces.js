var os = require('os');

var _getAllInterfaces;
switch (os.platform()) {

    case 'win32':
        _getAllInterfaces = require('./platform/getallinterfaces_windows.js');
        break;

    case 'linux':
        _getAllInterfaces = require('./platform/getallinterfaces_linux.js');
        break;

    case 'darwin':
    case 'sunos':
    case 'freebsd':
        _getAllInterfaces = require('./platform/getallinterfaces_unix.js');
        break;

    default:
        console.warn("node-macaddress: Unknown os.platform(), defaulting to 'unix'.");
        _getAllInterfaces = require('./platform/getallinterfaces_unix.js');
        break;

}

module.exports = _getAllInterfaces;

