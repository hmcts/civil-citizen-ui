const isProd = process.env.NODE_ENV === 'production' || false;

const webchatCNBCProd = {
  uuid: 'script_1191773643670e666a982030.90013235',
  tenant: 'aG1jdHN4MTAx',
  channel: 'NBC_CNBC_Web_Chat',
  channelUuid: 'YFOOn2KASGSaEd96HY8-BA',
  buttonContainerId: '__8x8-chat-button-container-script_1191773643670e666a982030.90013235',
};

const webchatCNBCNonProd = {
  uuid: 'script_35780229675c3e23dcdd66.11858382',
  tenant: 'aG1jdHNzdGFnaW5nMDE',
  channel: 'CNBC Webchat STAGING',
  channelUuid: 'QG-Cq97KTguzQz5H7T_n6g',
  buttonContainerId: '__8x8-chat-button-container-script_35780229675c3e23dcdd66.11858382',
};

window.__8x8Chat = {
  domain: 'https://vcc-eu4.8x8.com',
  path: '/.',
  align: 'right',
  ...(isProd ? webchatCNBCProd : webchatCNBCNonProd),
};

(function() {
  var se = document.createElement('script');
  se.type = 'text/javascript';
  se.async = true;
  se.src = window.__8x8Chat.domain + window.__8x8Chat.path + '/CHAT/common/js/chat.js';
  var os = document.getElementsByTagName('script')[0];
  os.parentNode.insertBefore(se, os);
})();
