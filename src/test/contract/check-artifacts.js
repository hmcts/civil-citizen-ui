const { canonicalize, validate } = require('./artifacts');
canonicalize();
const files = validate();
console.log(`Validated ${files.length} complete Pact artifacts`);
