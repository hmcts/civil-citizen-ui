const config = require('../../../../config');
const getDomain = config.getDomain;

module.exports = [
  {
    name: 'seen_cookie_message', 
    value: 'yes', 
    domain: getDomain(config.url.idamWeb), 
    path: '/', 
    secure: true,
  },
  {
    name: 'cookies_preferences_set',
    value: 'true',
    domain: getDomain(config.url.idamWeb),
    path: '/',
    secure: true,
  },
  {
    name:'cookies_policy',
    value: '{"essential":true,"analytics":true,"apm":true}',
    domain: getDomain(config.url.idamWeb),
    path: '/',
    secure: true,
  },
];