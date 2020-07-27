var UUID = require('../index');

setTimeout(function () {

    UUID.v1({}, function (err, id) {

        if (err) {
            throw err;
        }
        console.log(id);
        console.log(JSON.stringify(UUID.check(id), null, 2));

        console.log(UUID.stringify(UUID.parse(id)));
    });

    UUID.v1({}, function (err, id) {

        if (err) {
            throw err;
        }
        console.log(id);
        console.log(JSON.stringify(UUID.check(id), null, 2));

        console.log(UUID.stringify(UUID.parse(id)));
    });

    UUID.v4(function (err, id) {

        console.log(id);
        console.log(JSON.stringify(UUID.check(id), null, 2));

        console.log(UUID.stringify(UUID.parse(id)));
    });

    UUID.v3({
        namespace: UUID.namespace.url,
        name: "http://github.com"
    }, function (err, id) {

        if (err) {
            throw err;
        }

        console.log(id);
        console.log(JSON.stringify(UUID.check(id), null, 2));

        console.log(UUID.stringify(UUID.parse(id)));
    });

    UUID.v5({
        namespace: UUID.namespace.url,
        name: "http://github.com"
    }, function (err, id) {

        if (err) {
            throw err;
        }

        console.log(id);
        console.log(JSON.stringify(UUID.check(id), null, 2));

        console.log(UUID.stringify(UUID.parse(id)));
    });

}, 10);
