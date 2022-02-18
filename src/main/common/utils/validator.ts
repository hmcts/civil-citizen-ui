const validator = require('validator');

const isEmpty = (val: string) => validator.isEmpty(val);

module.exports = { isEmpty };
