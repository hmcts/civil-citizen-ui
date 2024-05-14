const getDomain = require('../../../../config').getDomain;

module.exports = [
  {
    name: 'cmc-cookie-preferences',
    value: '{"analytics":"on","apm":"on"}',
    domain: getDomain('https://moneyclaims.aat.platform.hmcts.net'),
    path: '/',
  },
];