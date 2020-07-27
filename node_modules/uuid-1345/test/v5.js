var assert = require('assert');
var UUID = require("../index");

describe("UUID.v5", function () {

    it("generates a v5 UUID (async)", function (done) {
        UUID.v5({
            name: "something",
            namespace: UUID.v4()
        }, function (err, result) {
            assert.equal(UUID.check(result).version, 5);
            done();
        });
    });

    it("generates a v5 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v5({ name: "something", namespace: UUID.v4() })).version, 5);
    });

    it("generates a v5 UUID (async, object)", function (done) {
        UUID.v5({
            name: "something",
            namespace: UUID.v4(),
            encoding: 'object'
        }, function (err, result) {
            assert.equal(result.version, 5);
            done();
        });
    });

    it("generates a v5 UUID (sync, object)", function () {
        assert.equal(UUID.v5({
            name: "something",
            namespace: UUID.v1(),
            encoding: 'object'
        }).version, 5);
    });

    it("generates a v5 UUID (async, buffer)", function (done) {
        UUID.v5({
            name: "something",
            namespace: UUID.v4(),
            encoding: 'binary'
        }, function (err, result) {
            assert.equal(new UUID(result).version, 5);
            done();
        });
    });

    it("generates a v5 UUID (sync, buffer)", function () {
        assert.equal(new UUID(UUID.v5({
            name: "something",
            namespace: UUID.v1(),
            encoding: 'binary'
        })).version, 5);
    });

    it("generates the correct uuid for `http://github.com`", function (done) {
        UUID.v5({
            namespace: UUID.namespace.url,
            name: 'http://github.com' 
        }, function (err, result) {
            assert.equal(result, 'f297a1ff-0099-5cd3-9a84-7ca20ceeeded');
            done();
        });
    });

});

