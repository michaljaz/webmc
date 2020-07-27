var assert = require('assert');
var UUID = require("../index");

describe("UUID.v3", function () {

    it("generates a v3 UUID (async)", function (done) {
        UUID.v3({
            name: "something",
            namespace: UUID.v4()
        }, function (err, result) {
            assert.equal(UUID.check(result).version, 3);
            done();
        });
    });

    it("generates a v3 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v3({ name: "something", namespace: UUID.v4() })).version, 3);
    });

    it("generates the correct uuid for `http://github.com`", function (done) {
        UUID.v3({
            namespace: UUID.namespace.url,
            name: 'http://github.com' 
        }, function (err, result) {
            assert.equal(result, '730433f1-7c3e-3939-a0c4-9c066e699799');
            done();
        });
    });

});

