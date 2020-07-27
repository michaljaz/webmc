var os = require('os');

var _getMacAddress;
var _validIfaceRegExp = '^[a-z0-9]+$';
switch (os.platform()) {

    case 'win32':
       // windows has long interface names which may contain spaces and dashes
        _validIfaceRegExp = '^[a-z0-9 -]+$';
        _getMacAddress = require('./platform/getmacaddress_windows.js');
        break;

    case 'linux':
        _getMacAddress = require('./platform/getmacaddress_linux.js');
        break;

    case 'darwin':
    case 'sunos':
    case 'freebsd':
        _getMacAddress = require('./platform/getmacaddress_unix.js');
        break;

    default:
        console.warn("node-macaddress: Unknown os.platform(), defaulting to 'unix'.");
        _getMacAddress = require('./platform/getmacaddress_unix.js');
        break;

}

var validIfaceRegExp = new RegExp(_validIfaceRegExp, 'i');

module.exports = function (iface, callback) {

    // some platform specific ways of resolving the mac address pass the name
    // of the interface down to some command processor, so check for a well
    // formed string here.
    if (!validIfaceRegExp.test(iface)) {
        callback(new Error([
            'invalid iface: \'', iface,
            '\' (must conform to reg exp /',
            validIfaceRegExp, '/)'
        ].join('')), null);
        return;
    }

    _getMacAddress(iface, callback);
}

