var test = require('tap').test;
var toggle = require('../');

test('toggle some endians', function (t) {
    var buf4 = new Buffer('abcd');
    var buf6 = new Buffer('abcdef');
    var buf12 = new Buffer('abcdefghijkl');
    
    t.equal(toggle(buf4, 16).toString(), 'badc');
    t.equal(buf4.toString(), 'abcd');
    
    t.throws(function () {
        toggle(buf6, 32);
    }, 'non-aligned offset');
    
    t.equal(toggle(buf12, 24).toString(), 'cbafedihglkj');
    
    t.end('ian');
});
