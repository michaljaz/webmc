var assert = require('assert');
var UUID = require("../index");

describe("Utilities", function () {

    it("stringify . parse == id", function (done) {
        UUID.v4(function (err, result) {
            var one = result;
            var two = UUID.stringify(UUID.parse(result));
            assert.equal(one, two);
            done();
        });
    });

});

describe("UUID.check", function () {

    it("identifies v1 UUID correctly", function (done) {
        assert.equal(UUID.check('923462b0-d736-11e4-89e3-77046a5cefa6').version, 1);
        done();
    });

    it("identifies v3 UUID correctly", function (done) {
        assert.equal(UUID.check('730433f1-7c3e-3939-a0c4-9c066e699799').version, 3);
        done();
    });

    it("identifies v4 UUID correctly", function (done) {
        assert.equal(UUID.check('135BA59F-D09C-4439-938E-07E1D62CA999').version, 4);
        done();
    });

    it("identifies v5 UUID correctly", function (done) {
        assert.equal(UUID.check('f297a1ff-0099-5cd3-9a84-7ca20ceeeded').version, 5);
        done();
    });
    
    it("identifies rfc4122 variant correctly", function (done) {
        assert.equal(UUID.check('f297a1ff-0099-5cd3-9a84-7ca20ceeeded').variant, 'rfc4122');
        done();
    });
    
    it("identifies microsoft variant correctly", function (done) {
        assert.equal(UUID.check('f297a1ff-0099-5cd3-dddd-7ca20ceeeded').variant, 'microsoft');
        done();
    });

    it("identifies ncs variant correctly", function (done) {
        assert.equal(UUID.check('f297a1ff-0099-5cd3-0000-7ca20ceeeded').variant, 'ncs');
        done();
    });

    it("identifies future variant correctly", function (done) {
        assert.equal(UUID.check('ffffffff-ffff-ffff-ffff-ffffffffffff').variant, 'future');
        done();
    });

});

