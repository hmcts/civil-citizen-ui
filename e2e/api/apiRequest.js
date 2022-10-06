const config = require('../config.js');

const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper.js');
const totp = require('totp-generator');

const tokens = {};
const getCcdDataStoreBaseUrl = () => `${config.url.ccdDataStore}/caseworkers/${tokens.userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseType}`;
const getCcdDataStoreGABaseUrl = () => `${config.url.ccdDataStore}/caseworkers/${tokens.userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseTypeGA}`;

const getCcdCaseUrl = (userId, caseId) => `${config.url.ccdDataStore}/aggregated/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseType}/cases/${caseId}`;
const getPaymentCallbackUrl = () => `${config.url.generalApplication}/service-request-update`;
const getRequestHeaders = (userAuth) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userAuth}`,
    'ServiceAuthorization': tokens.s2sAuth,
  };
};
const getGeneralApplicationBaseUrl = () => `${config.url.generalApplication}/testing-support/case/`;

module.exports = {
  setupTokens: async (user) => {
    tokens.userAuth = await idamHelper.accessToken(user);
    tokens.userId = await idamHelper.userId(tokens.userAuth);
    tokens.s2sAuth = await restHelper.retriedRequest(
      `${config.url.authProviderApi}/lease`,
      {'Content-Type': 'application/json'},
      {
        microservice: config.s2s.microservice,
        oneTimePassword: totp(config.s2s.secret),
      })
      .then(response => response.text());
  },

  fetchCaseForDisplay: async(user, caseId, response = 200) => {
    let eventUserAuth = await idamHelper.accessToken(user);
    let eventUserId = await idamHelper.userId(eventUserAuth);
    let url = getCcdCaseUrl(eventUserId, caseId);

    return await restHelper.retriedRequest(url, getRequestHeaders(eventUserAuth), null, 'GET', response)
      .then(response => response.json());
  },

  paymentApiRequestUpdateServiceCallback: async (serviceRequestUpdateDto) => {
    let url = getPaymentCallbackUrl();
    let response = await restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth),
      serviceRequestUpdateDto,'PUT');
    return response || {};
  },

  startEvent: async (eventName, caseId) => {
    let url = getCcdDataStoreBaseUrl();
    if (caseId) {
      url += `/cases/${caseId}`;
    }
    url += `/event-triggers/${eventName}/token`;

    let response = await restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth), null, 'GET')
      .then(response => response.json());
    tokens.ccdEvent = response.token;
    return response.case_details.case_data || {};
  },

  startGAEvent: async (eventName, caseId) => {
    let url = getCcdDataStoreGABaseUrl();
    if (caseId) {
      url += `/cases/${caseId}`;
    }
    url += `/event-triggers/${eventName}/token`;

    let response = await restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth), null, 'GET')
      .then(response => response.json());
    tokens.ccdEvent = response.token;

    return response.case_details.case_data || {};
  },

  submitGAEvent: async (eventName, caseData, caseId) => {
    let url = `${getCcdDataStoreGABaseUrl()}/cases`;
    if (caseId) {
      url += `/${caseId}/events`;
    }

    return restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth),
      {
        data: caseData,
        event: {id: eventName},
        event_data: caseData,
        event_token: tokens.ccdEvent,
      }, 'POST', 201);
  },

  validatePage: async (eventName, pageId, caseData, caseId, expectedStatus = 200) => {
    return restHelper.retriedRequest(`${getCcdDataStoreBaseUrl()}/validate?pageId=${eventName}${pageId}`, getRequestHeaders(tokens.userAuth),
      {
        case_reference: caseId,
        data: caseData,
        event: {id: eventName},
        event_data: caseData,
        event_token: tokens.ccdEvent,
      }, 'POST', expectedStatus);
  },

  submitEvent: async (eventName, caseData, caseId) => {
    let url = `${getCcdDataStoreBaseUrl()}/cases`;
    if (caseId) {
      url += `/${caseId}/events`;
    }

    return restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth),
      {
        data: caseData,
        event: {id: eventName},
        event_data: caseData,
        event_token: tokens.ccdEvent,
      }, 'POST', 201);
  },

  fetchUpdatedCaseData: async (caseId) => {

    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

    let url = getGeneralApplicationBaseUrl();
    console.log('*** Civil Case Reference: '  + caseId + ' ***');
    if (caseId) {
      url += `${caseId}`;
    }

    return await restHelper.retriedRequest(url,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },null, 'GET');
  },

  fetchUpdatedGABusinessProcessData: async (caseId) => {

    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

    let url = getGeneralApplicationBaseUrl();
    console.log('*** GA Case Reference: '  + caseId + ' ***');
    if (caseId) {
      url += `${caseId}/business-process`;
    }

    return await restHelper.retriedRequest(url,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },null, 'GET');
  },
};
