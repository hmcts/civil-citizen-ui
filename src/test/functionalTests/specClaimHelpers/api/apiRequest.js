const config = require('../../../config');

const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper.js');
const totp = require('totp-generator');

const tokens = {};
const getCcdDataStoreBaseUrl = () => `${config.url.ccdDataStore}/caseworkers/${tokens.userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseType}`;
const getCcdCaseUrl = (userId, caseId) => `${config.url.ccdDataStore}/aggregated/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseType}/cases/${caseId}`;
const getCaseDetailsUrl = (userId, caseId) => `${config.url.ccdDataStore}/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${config.definition.caseType}/cases/${caseId}`;
//const getXUIURL = () => `${config.url.manageCase}/data/case-types/CIVIL`;
const getRequestHeaders = (userAuth) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userAuth}`,
    'ServiceAuthorization': tokens.s2sAuth,
  };
};
const getCivilServiceUrl = () => `${config.url.civilService}`;

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

  fetchCaseDetails: async(user, caseId, response = 200) => {
    let eventUserAuth = await idamHelper.accessToken(user);
    let eventUserId = await idamHelper.userId(eventUserAuth);
    let url = getCaseDetailsUrl(eventUserId, caseId);

    return await restHelper.retriedRequest(url, getRequestHeaders(eventUserAuth), null, 'GET', response)
      .then(response => response.json());
  },

  fetchCaseForDisplay: async(user, caseId, response = 200) => {
    let eventUserAuth = await idamHelper.accessToken(user);
    let eventUserId = await idamHelper.userId(eventUserAuth);
    let url = getCcdCaseUrl(eventUserId, caseId);

    return await restHelper.retriedRequest(url, getRequestHeaders(eventUserAuth), null, 'GET', response)
      .then(response => response.json());
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

  startEventForCitizen: async (eventName, caseId, payload) => {
    let url = getCivilServiceUrl();
    const userId = await idamHelper.userId(tokens.userAuth);
    console.log('The value of the userId from the startEventForCitizen() : '+userId);
    if (caseId) {
      url += `/cases/${caseId}`;
    }
    url += `/citizen/${userId}/event`;

    let response = await restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth), payload, 'POST',200)
      .then(response => response.json());
    tokens.ccdEvent = response.token;
  },

  validatePageForMidEvent: async (eventName, pageId, caseData, caseId, expectedStatus = 200) => {
    return restHelper.retriedRequest(`${getCcdDataStoreBaseUrl()}/validate?pageId=${eventName}${pageId}`, getRequestHeaders(tokens.userAuth),
      {
        case_reference: caseId,
        data: caseData,
        event: {id: eventName},
        event_data: caseData,
        event_token: tokens.ccdEvent,
      }, 'POST', expectedStatus);
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

  paymentUpdate: async (caseId, endpoint, serviceRequestUpdateDto) => {
    let endpointURL = getCivilServiceUrl() + endpoint;
    let response = await restHelper.retriedRequest(endpointURL, getRequestHeaders(tokens.userAuth),
      serviceRequestUpdateDto,'PUT');

    return response || {};
  },

  uploadDocument: async () => {
    let endpointURL = getCivilServiceUrl() + '/testing-support/upload/test-document';
    let response = await restHelper.retriedRequest(endpointURL, getRequestHeaders(tokens.userAuth),
      {}, 'POST');
    return await response.json();
  },
};
