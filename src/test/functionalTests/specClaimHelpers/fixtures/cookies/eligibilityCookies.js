const config = require('../../../../config');
const getDomain = config.getDomain;

module.exports = [
  {
    name: 'eligibilityCompleted',
    value: 'true',
    domain: getDomain(config.TestUrl),
    path: '/',
  },
];
