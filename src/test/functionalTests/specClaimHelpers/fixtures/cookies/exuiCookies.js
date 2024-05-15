const config = require('../../../../config');
const idamHelper = require('../../api/idamHelper');
const getDomain = config.getDomain;

module.exports = async (user) => {
  const accessToken = await idamHelper.accessToken(user);
  const userId = await idamHelper.userId(accessToken);
  return [
    {
      name: `hmcts-exui-cookies-${userId}-mc-accepted`,
      value: 'true',
      domain: getDomain(config.url.manageCase),
      path: '/',
    },
  ];
};