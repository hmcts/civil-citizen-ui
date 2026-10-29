// mocha-multi expects a constructor; CodeceptJS 4 exports its reporter as ESM.
module.exports = require('codeceptjs/lib/mocha/cli').default;
