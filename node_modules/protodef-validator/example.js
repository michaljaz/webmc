const Validator=require('./');

const example_protocol=require("./example_protocol.json");

const validator = new Validator();

validator.validateProtocol(example_protocol);

