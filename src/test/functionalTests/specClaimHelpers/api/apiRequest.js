const config = require('../../../config');

const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper.js');
const {retry} = require('./retryHelper');
const totp = require('totp-generator');

const TASK_MAX_RETRIES = 20;
const TASK_RETRY_TIMEOUT_MS = 20000;

const tokens = {};
const getCcdDataStoreBaseUrl = (caseType = 'CIVIL') => `${config.url.ccdDataStore}/caseworkers/${tokens.userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${caseType}`;
const getCcdCaseUrl = (userId, caseId, caseType = 'CIVIL') => `${config.url.ccdDataStore}/aggregated/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${caseType}/cases/${caseId}`;
const getCaseDetailsUrl = (userId, caseId, caseType = 'CIVIL') => `${config.url.ccdDataStore}/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}/case-types/${caseType}/cases/${caseId}`;
//const getXUIURL = () => `${config.url.manageCase}/data/case-types/CIVIL`;
const getRequestHeaders = (userAuth) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userAuth}`,
    'ServiceAuthorization': tokens.s2sAuth,
  };
};
const getCivilServiceUrl = () => `${config.url.civilService}`;

const fetchCaseDetails = async(user, caseId, response = 200) => {
  let eventUserAuth = await idamHelper.accessToken(user);
  let eventUserId = await idamHelper.userId(eventUserAuth);
  let url = getCaseDetailsUrl(eventUserId, caseId);
  return await restHelper.retriedRequest(url, getRequestHeaders(eventUserAuth), null, 'GET', response)
    .then(response => response.json());
};

module.exports = {
  getTokens: () => tokens,
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

  fetchCaseDetails,
  fetchCaseDetailsAsSystemUser: async (caseId) => {
    const { userAuth, userId } = tokens;
    const details = await fetchCaseDetails(config.systemUpdate, caseId, 200);
    // Reset auth and id back to original user.
    tokens.userAuth = userAuth;
    tokens.userId = userId;
    return details;
  },
  fetchCaseForDisplay: async(user, caseId, response = 200) => {
    let eventUserAuth = await idamHelper.accessToken(user);
    let eventUserId = await idamHelper.userId(eventUserAuth);
    let url = getCcdCaseUrl(eventUserId, caseId);

    return await restHelper.retriedRequest(url, getRequestHeaders(eventUserAuth), null, 'GET', response)
      .then(response => response.json());
  },

  startEvent: async (eventName, caseId, caseType='CIVIL') => {
    let url = getCcdDataStoreBaseUrl(caseType);
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
    if (caseId) {
      url += `/cases/${caseId}`;
    }
    url += `/citizen/${userId}/event`;

    let response = await restHelper.retriedRequest(url, getRequestHeaders(tokens.userAuth), payload, 'POST', 200);
    const data = await response.json();
    if (data?.token) {
      tokens.ccdEvent = data.token;
    }
    return data.case_data;
  },

  startEventForLiPCitizen: async (payload) => {
    let url = getCivilServiceUrl();
    const userId = await idamHelper.userId(tokens.userAuth);
    url += `/cases/draft/citizen/${userId}/event`;

    const response = await restHelper.request(url, getRequestHeaders(tokens.userAuth), payload, 'POST', 200);
    const data = await response.json();
    console.log('***************** case id ***************** ' + data.id);
    return data.id;
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

  submitEvent: async (eventName, caseData, caseId, caseType='CIVIL') => {
    let url = `${getCcdDataStoreBaseUrl(caseType)}/cases`;
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

  taskActionByUser: async function (user, taskId, action, expectedStatus = 204) {
    const userToken = await idamHelper.accessToken(user);
    const s2sToken = await restHelper.retriedRequest(
      `${config.url.authProviderApi}/lease`,
      {'Content-Type': 'application/json'},
      {
        microservice: config.s2sForXUI.microservice,
        oneTimePassword: totp(config.s2sForXUI.secret),
      })
      .then(response => response.text());

    return retry(() => {
      return restHelper.request(`${config.url.waTaskMgmtApi}/task/${taskId}/${action}`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'ServiceAuthorization': `Bearer ${s2sToken}`,
        }, '', 'POST', expectedStatus);
    }, 2, TASK_RETRY_TIMEOUT_MS);
  },

  fetchTaskDetails: async (user, caseNumber, taskType, expectedStatus = 200) => {
    let taskDetails;
    const userToken = await idamHelper.accessToken(user);
    const s2sToken = await restHelper.retriedRequest(
      `${config.url.authProviderApi}/lease`,
      {'Content-Type': 'application/json'},
      {
        microservice: config.s2sForXUI.microservice,
        oneTimePassword: totp(config.s2sForXUI.secret),
      })
      .then(response => response.text());

    const inputData = {
      'search_parameters': [
        {'key': 'caseId', 'operator': 'IN', 'values': [caseNumber]},
        {'key': 'jurisdiction', 'operator': 'IN', 'values': ['CIVIL']},
        {'key': 'state', 'operator': 'IN', 'values': ['assigned', 'unassigned']},
      ],
      'sorting_parameters': [{'sort_by': 'dueDate', 'sort_order': 'asc'}],
    };

    return retry(() => {
      return restHelper.request(`${config.url.waTaskMgmtApi}/task`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'ServiceAuthorization': `Bearer ${s2sToken}`,
        }, inputData, 'POST', expectedStatus)
        .then(async response => await response.json())
        .then(jsonResponse => {
          let availableTaskDetails = jsonResponse['tasks'];
          availableTaskDetails.forEach((taskInfo) => {
            if (taskInfo['type'] == taskType) {
              console.log('Found taskInfo with type ...', taskType);
              console.log('Task details are ...', taskInfo);
              taskDetails = taskInfo;
            }
          });
          if (!taskDetails) {
            throw new Error(`Ongoing task retrieval process for case id: ${caseNumber}`);
          } else {
            return taskDetails;
          }
        });
    }, TASK_MAX_RETRIES, TASK_RETRY_TIMEOUT_MS);
  },
};
