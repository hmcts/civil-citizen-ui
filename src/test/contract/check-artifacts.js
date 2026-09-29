const { canonicalize, validate } = require('./artifacts');
const { dirname } = require('path');
const files = validate();
canonicalize(dirname(files[0]));
console.log(`Validated ${files.length} complete Pact artifacts`);
