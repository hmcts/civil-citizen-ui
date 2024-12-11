import {CONTACT_CNBC_URL} from '../../routes/urls';

const cNBCConfig= {
  uuid: 'script_1191773643670e666a982030.90013235',
  tenant: 'aG1jdHN4MTAx',
  channel: 'NBC_CNBC_Web_Chat',
  channelUuid: 'YFOOn2KASGSaEd96HY8-BA',
  domain: 'https://vcc-eu4.8x8.com',
  path: '/.',
  buttonContainerId: '__8x8-chat-button-container-script_1191773643670e666a982030.90013235',
  align: 'right',
};

const mediationConfig = {
  uuid: 'script_202736819566d85c96c386f8.18964185',
  tenant: 'aG1jdHN4MTAx',
  channel: 'NBC_Mediation_Webchat',
  channelUuid: 'EfkT-IMvRReo_VGNJ5ietQ',
  domain: 'https://vcc-eu4.8x8.com',
  path: '/.',
  buttonContainerId: '__8x8-chat-button-container-script_202736819566d85c96c386f8.18964185',
  align: 'right',
};

const pathname = window.location.pathname;
window.__8x8Chat = pathname === CONTACT_CNBC_URL ? cNBCConfig : mediationConfig;

(function() {
  var se = document.createElement('script');
  se.type = 'text/javascript';
  se.async = true;
  se.src = window.__8x8Chat.domain + window.__8x8Chat.path + '/CHAT/common/js/chat.js';
  var os = document.getElementsByTagName('script')[0];
  os.parentNode.insertBefore(se, os);
})();
