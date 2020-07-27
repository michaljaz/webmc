var assert = require('assert');
var macaddress = require('macaddress');
var UUID = require("../index");

describe("UUID.v1", function () {

    it("generates a v1 UUID (async)", function (done) {
        UUID.v1(function (err, result) {
            assert.equal(UUID.check(result).version, 1);
            done();
        });
    });

    it("generates a v1 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v1()).version, 1);
    });

    it("generates a v1 UUID (buffer, async)", function (done) {
        UUID.v1({ encoding: 'binary' }, function (err, result) {
            assert.equal(UUID.check(result).version, 1);
            done();
        });
    });

    it("generates a v1 UUID (buffer, sync)", function () {
        assert.equal(UUID.check(UUID.v1({ encoding: 'binary' })).version, 1);
    });

    it("generates a v1 UUID (object, async)", function (done) {
        UUID.v1({ encoding: 'object' }, function (err, result) {
            assert.equal(result.version, 1);
            done();
        });
    });

    it("generates a v1 UUID (object, sync)", function () {
        assert.equal(UUID.v1({ encoding: 'object' }).version, 1);
    });
 
    it("uses the MAC address", function (done) {
        macaddress.one(function (err, addr) {
            assert.equal(addr.replace(/:/g, ""), UUID.v1().substring(24));
            done();
        });
    });
    
    it("uses the specified MAC address", function (done) {
        UUID.v1({ mac: 'ab:cd:ef:00:47:11' }, function (err, result) {
            assert.equal('abcdef004711', result.substring(24));
            done();
        });
    });
    
    it("uses the randomized node when { mac: false }", function (done) {
        macaddress.one(function (err, addr) {
            assert(addr.replace(/:/g, "") != UUID.v1({ mac: false }).substring(24));
            done();
        });
    });

    it("shows UUID in .inspect() (for nodes console.log)", function () {
        var uuid = UUID.v1({ encoding: 'object' });
        assert(uuid.inspect().indexOf(uuid.toString()) >= 0);
    });

});
