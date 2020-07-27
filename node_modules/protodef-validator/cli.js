#!/usr/bin/env node

const Validator=require('./');
const fs=require('fs');

if(process.argv.length <3 || process.argv.length >4) {
  console.log("Usage : node echo.js <protocol.json> [<customSchemas>]");
  process.exit(1);
}

const protocolPath=process.argv[2];
const customSchemasPath=process.argv[3];

const validator = new Validator();

if(customSchemasPath)
  validator.addTypes(JSON.parse(fs.readFileSync(customSchemasPath)));

validator.validateProtocol(JSON.parse(fs.readFileSync(protocolPath)));
