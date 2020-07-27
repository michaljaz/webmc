var NodeRSA = require('./src/NodeRSA');
const constants = require('constants');

function pkcs1pad2(s, k) {
    var n = (k + 7) >> 3;
    if(n < s.length + 11) {
        return null;
    }
    var ba = new Array(n);
    var i = s.length - 1;
    while(i >= 0 && n > 0) {
        var c = s[i--];
        if(c < 128) {
            ba[--n] = c;
        } else {
            ba[--n] = (c & 63) | 128;
            ba[--n] = (c >> 6) | 192;
        }
    }
    ba[--n] = 0;
    while(n > 2) {
        ba[--n] = 0;
        while(ba[n] == 0)
            ba[n] = Math.floor(Math.random() * 254 + 1);
    }
    ba[--n] = 2;
    ba[--n] = 0;
    return ba;
}

function pkcs1pad0(s, k) {
    var n = (k + 7) >> 3;
    if(n < s.length + 11) {
        return null;
    }
    var ba = new Array(n);
    var i = s.length - 1;
    while(i >= 0 && n > 0) {
        var c = s[i--];
        if(c < 128) {
            ba[--n] = c;
        } else {
            ba[--n] = (c & 63) | 128;
            ba[--n] = (c >> 6) | 192;
        }
    }
    ba[--n] = 0;
    while(n > 2) {
        ba[--n] = 0;
        while(ba[n] == 0)
            ba[n] = Math.floor(Math.random() * 254 + 1);
    }
    ba[--n] = 2;
    ba[--n] = 0;
    return ba;
}


const key = new NodeRSA({b: 1024});
const rsa_key = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsV3U9BKwt3Wgy/N2HpI/qaVXV\n9zYjWXyuO/IpcEa0FIPH8LOSca0pk9ab/8fufAoohjTPPfcB0bmLf9X8wP9ZRHBG\ntUICIjvHNywPfoQ9/E/m6ebP/Ke6yDqBaPBx/pTiaUmBOSS0/EfDIiwNGiJz6xua\nBwn0S3SdIzFIZVjXiwIDAQAB\n-----END PUBLIC KEY-----'

const data = [17, 105, 21, 237, 144, 244, 90, 203, 201, 47, 48, 59, 85, 218, 217, 223, 228, 187, 222, 198, 38, 222, 239, 62, 80, 209, 244, 230, 211, 111, 65, 16];

console.log(data, rsa_key);
var dec = new NodeRSA(
    rsa_key, 'pkcs8-public', {
        environment: 'browser',
        encryptionScheme: {
            scheme: 'pkcs1',
            padding: constants.RSA_NO_PADDING
        }
    }
);
var arr = data; // pkcs1pad2(data, 1024);
console.log(arr);
console.log(dec.getKeySize(), dec.getMaxMessageSize(), arr.length);
try {
    var e = dec.encrypt(Buffer.from(arr));
    console.log(e);
} catch(e) {
    console.log(e);
}