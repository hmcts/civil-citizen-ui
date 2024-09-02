const config = require('../../../../config');
const getDomain = config.getDomain;

module.exports = [
  {
    name: 'money-claims-cookie-preferences',
    value: '{"analytics":"on","apm":"on"}',
    domain: getDomain(config.TestUrl),
    path: '/',
  },
];
