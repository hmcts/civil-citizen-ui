const validator = require('validator');

const isEmpty = (val: string) => validator.isEmpty(val);
const isNumber = (val: string) => val.match(/.*[^0-9].*/);

module.exports = { isEmpty, isNumber};
