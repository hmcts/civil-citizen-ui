const { validate } = require('./artifacts');
const files = validate();
console.log(`Validated ${files.length} complete Pact artifacts`);
