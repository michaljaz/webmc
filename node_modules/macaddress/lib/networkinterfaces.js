var os = require('os');

// Retrieves all interfaces that do feature some non-internal address.
// This function does NOT employ caching as to reflect the current state
// of the machine accurately.
module.exports = function () {
    var allAddresses = {};

    try {
        var ifaces = os.networkInterfaces();
    } catch (e) {
        // At October 2016 WSL does not support os.networkInterfaces() and throws
        // Return empty object as if no interfaces were found
        // https://github.com/Microsoft/BashOnWindows/issues/468
        if (e.syscall === 'uv_interface_addresses') {
            return allAddresses;
        } else {
            throw e;
        };
    };

    Object.keys(ifaces).forEach(function (iface) {
        var addresses = {};
        var hasAddresses = false;
        ifaces[iface].forEach(function (address) {
            if (!address.internal) {
                addresses[(address.family || "").toLowerCase()] = address.address;
                hasAddresses = true;
                if (address.mac && address.mac !== '00:00:00:00:00:00') {
                    addresses.mac = address.mac;
                }
            }
        });
        if (hasAddresses) {
            allAddresses[iface] = addresses;
        }
    });
    return allAddresses;
};

