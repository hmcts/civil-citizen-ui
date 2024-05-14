const config = require("../../../../config");
const getDomain = config.getDomain;

module.exports = {
  generateAcceptExuiCookies: (userId) => [
    {
      name: `hmcts-exui-cookies-${userId}-mc-accepted`,
      value: 'true',
      domain: getDomain(config.url.manageCase),
      path: '/',
    },
  ]
}