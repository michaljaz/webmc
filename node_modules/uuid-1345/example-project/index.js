const uuid = require('uuid-1345');

const opt = {
    namespace: uuid.namespace.url,
    name: 'https://github.com/scravy/uuid-1345'
};

console.log(uuid.v1());
console.log(uuid.v3(opt));
console.log(uuid.v4());
console.log(uuid.v5(opt));

uuid.v1(console.log);
uuid.v3(opt, console.log);
uuid.v4(console.log);
uuid.v5(opt, console.log);

