var assert = require('assert');

describe('uint4', function() {

    var uint4 = require('../index.js');

    describe('#readUInt4BE(buffer, cursor)', function() {

        it('should read half a byte', function() {
            var buf = new Buffer(4);
            buf[0] = 0x35;
            buf[1] = 0x01;
            buf[2] = 0x10;
            buf[3] = 0xff;

            assert.equal(0x03, uint4.readUInt4BE(buf, 0.0));
            assert.equal(0x05, uint4.readUInt4BE(buf, 0.5));
            assert.equal(0x00, uint4.readUInt4BE(buf, 1.0));
            assert.equal(0x01, uint4.readUInt4BE(buf, 1.5));
            assert.equal(0x01, uint4.readUInt4BE(buf, 2.0));
            assert.equal(0x00, uint4.readUInt4BE(buf, 2.5));
            assert.equal(0x0f, uint4.readUInt4BE(buf, 3.0));
            assert.equal(0x0f, uint4.readUInt4BE(buf, 3.5));
        });

    });

    describe('#writeUInt4BE(buffer, value, cursor)', function() {

        it('should write half a byte', function() {
            var buf = new Buffer(4);

            uint4.writeUInt4BE(buf, 0x03, 0.0);
            uint4.writeUInt4BE(buf, 0x05, 0.5);
            uint4.writeUInt4BE(buf, 0x00, 1.0);
            uint4.writeUInt4BE(buf, 0x01, 1.5);
            uint4.writeUInt4BE(buf, 0x01, 2.0);
            uint4.writeUInt4BE(buf, 0x00, 2.5);
            uint4.writeUInt4BE(buf, 0x0f, 3.0);
            uint4.writeUInt4BE(buf, 0x0f, 3.5);

            assert.equal(0x35, buf[0]);
            assert.equal(0x01, buf[1]);
            assert.equal(0x10, buf[2]);
            assert.equal(0xff, buf[3]);
        });

        it('should throw when given values >= 16', function() {
            var buf = new Buffer(4);

            assert.throws(function() {
                writeUInt4(buf, 20, 0);
            });
        });

     });

     describe('#readUInt4LE(buffer, cursor)', function() {

         it('should read half a byte', function() {
             var buf = new Buffer(4);
             buf[0] = 0x53;
             buf[1] = 0x10;
             buf[2] = 0x01;
             buf[3] = 0xff;

             assert.equal(0x03, uint4.readUInt4LE(buf, 0.0));
             assert.equal(0x05, uint4.readUInt4LE(buf, 0.5));
             assert.equal(0x00, uint4.readUInt4LE(buf, 1.0));
             assert.equal(0x01, uint4.readUInt4LE(buf, 1.5));
             assert.equal(0x01, uint4.readUInt4LE(buf, 2.0));
             assert.equal(0x00, uint4.readUInt4LE(buf, 2.5));
             assert.equal(0x0f, uint4.readUInt4LE(buf, 3.0));
             assert.equal(0x0f, uint4.readUInt4LE(buf, 3.5));
         });

     });

     describe('#writeUInt4LE(buffer, value, cursor)', function() {

         it('should write half a byte', function() {
             var buf = new Buffer(4);

             uint4.writeUInt4LE(buf, 0x03, 0.0);
             uint4.writeUInt4LE(buf, 0x05, 0.5);
             uint4.writeUInt4LE(buf, 0x00, 1.0);
             uint4.writeUInt4LE(buf, 0x01, 1.5);
             uint4.writeUInt4LE(buf, 0x01, 2.0);
             uint4.writeUInt4LE(buf, 0x00, 2.5);
             uint4.writeUInt4LE(buf, 0x0f, 3.0);
             uint4.writeUInt4LE(buf, 0x0f, 3.5);

             assert.equal(0x53, buf[0]);
             assert.equal(0x10, buf[1]);
             assert.equal(0x01, buf[2]);
             assert.equal(0xff, buf[3]);
         });

         it('should throw when given values >= 16', function() {
             var buf = new Buffer(4);

             assert.throws(function() {
                 writeUInt4LE(buf, 20, 0);
             });
         });

      });

});
