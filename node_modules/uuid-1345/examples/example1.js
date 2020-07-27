var UUID = require('../index');

console.log("Generated a fast v4 UUID:\n\t%s\n", UUID.v4fast());

UUID.v4(function (err, result) {
    console.log("Generated a random UUID:\n\t%s\n", result);
});

UUID.v3({
    namespace: UUID.namespace.url,
    name: "https://github.com/scravy/uuid-1345"
}, function (err, result) {
    console.log("Generated a name-based UUID using MD5:\n\t%s\n", result);
});

UUID.v5({
    namespace: UUID.namespace.url,
    name: "https://github.com/scravy/uuid-1345"
}, function (err, result) {
    console.log("Generated a name-based UUID using SHA1:\n\t%s\n", result);
});

UUID.v1(function (err, result) {
    console.log("Generated a time-based UUID:\n\t%s\n", result);
});

