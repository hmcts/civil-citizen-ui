const apiRequest = require('./apiRequest');
const {waitForFinishedBusinessProcess} = require('./testingSupport');

const chai = require('chai');
const {queryResponseMessage, followUpQueryMessage, initialQueryMessage} = require('../fixtures/queryMessages');
const {expect} = chai;

const RAISE_QUERY_EVENT = 'queryManagementRaiseQuery';
const RESPOND_QUERY_EVENT = 'queryManagementRespondQuery';

const assertQueryMessage = (actualQueryMessage, expectedQueryMessage) => {
  expect(actualQueryMessage.id).equal(expectedQueryMessage.id);
  expect(new Date(actualQueryMessage.createdOn).toISOString()).equal(new Date(expectedQueryMessage.createdOn).toISOString());
  expect(actualQueryMessage.createdBy).equal(expectedQueryMessage.createdBy);
  expect(actualQueryMessage.body).equal(expectedQueryMessage.body);
  expect(actualQueryMessage.isHearingRelated).equal(expectedQueryMessage.isHearingRelated);
  expect(actualQueryMessage.hearingDate).equal(expectedQueryMessage.hearingDate);
};

const createQueryPayload = (caseData, queryType, newMessage) => {
  const queryPayload = {
    [queryType.collectionField]: caseData[queryType.collectionField] ? caseData[queryType.collectionField] : {
      partyName: queryType.partyName,
      caseMessages: [],
    },
  };
  queryPayload[queryType.collectionField].caseMessages.push(newMessage);
  return queryPayload;
};

const triggerCaseworkerQueryEvent = async (caseId, event, queryType, newMessage) => {
  const updatedCaseData = await triggerCaseworkerEvent(caseId, event,
    (caseData) => createQueryPayload(caseData, queryType, newMessage));

  const actualQueryCollection = updatedCaseData[queryType.collectionField];
  const latestQueryMessage = actualQueryCollection.caseMessages[actualQueryCollection.caseMessages.length - 1].value;

  expect(actualQueryCollection.partyName).equal(queryType.partyName);
  assertQueryMessage(latestQueryMessage, newMessage.value);

  await waitForFinishedBusinessProcess(caseId);
  return latestQueryMessage;
};

const triggerCitizenQueryEvent = async (caseId, event, queryType, newMessage) => {
  const updatedCaseData = await triggerCitizenEvent(caseId, event,
    (caseData) => createQueryPayload(caseData, queryType, newMessage));

  const actualQueryCollection = updatedCaseData[queryType.collectionField];
  const latestQueryMessage = actualQueryCollection.caseMessages[actualQueryCollection.caseMessages.length - 1].value;

  expect(actualQueryCollection.partyName).equal(queryType.partyName);
  assertQueryMessage(latestQueryMessage, newMessage.value);

  await waitForFinishedBusinessProcess(caseId);
  return latestQueryMessage;
};

const triggerCaseworkerEvent = async (caseId, event, queryPayloadCallback) => {
  const preEventData = await apiRequest.startEvent(event, caseId);
  const payload = queryPayloadCallback(preEventData);
  const response = await apiRequest.submitEvent(event, payload, caseId);
  return (await response.json()).case_data;
};

const triggerCitizenEvent = async (caseId, event, queryPayloadCallback) => {
  const caseData = (await apiRequest.fetchCaseDetailsAsSystemUser(caseId)).case_data;
  const payload = queryPayloadCallback(caseData);
  return apiRequest.startEventForCitizen(event, caseId, {event, caseDataUpdate: payload});
};

const findPartyNameForQueryFromUserConfig = async (user) => {
  const partyType = user.type;
  if (partyType.includes('applicant') || partyType.includes('claimant')) {
    return 'Claimant';
  } else if (partyType.includes('defendant')) {
    return 'Defendant';
  }
  return 'All queries';
};

module.exports = {
  raiseLRQuery: async (caseId, user, queryType, isHearingRelated= true) => {
    console.log(`Raising a query as: ${user.email}`);
    await apiRequest.setupTokens(user);
    const partyName = await findPartyNameForQueryFromUserConfig(user);
    const newMessage = (await initialQueryMessage(partyName, apiRequest.getTokens().userId, isHearingRelated));
    return triggerCaseworkerQueryEvent(caseId, RAISE_QUERY_EVENT, queryType, newMessage);
  },
  respondToQuery: async (caseId, user, initialQueryMessage, queryType, closeQuery = false) => {
    console.log(`Responding to query as: ${user.email}`);
    await apiRequest.setupTokens(user);
    const newMessage = await queryResponseMessage(initialQueryMessage, apiRequest.getTokens().userId, closeQuery);
    await triggerCaseworkerQueryEvent(caseId, RESPOND_QUERY_EVENT, queryType, newMessage);
  },
  followUpOnLRQuery: async (caseId, user, initialQueryMessage, queryType) => {
    console.log(`Following up on query as: ${user.email}`);
    await apiRequest.setupTokens(user);
    const newMessage = await followUpQueryMessage(initialQueryMessage, apiRequest.getTokens().userId);
    return triggerCaseworkerQueryEvent(caseId, RAISE_QUERY_EVENT, queryType, newMessage);
  },
  raiseLipQuery: async (caseId, user, queryType, isHearingRelated=true) => {
    console.log(`Raising a query as: ${user.email}`);
    await apiRequest.setupTokens(user);
    const partyName = await findPartyNameForQueryFromUserConfig(user);
    const newMessage = await initialQueryMessage(partyName, apiRequest.getTokens().userId, isHearingRelated);
    const submittedMessage = await triggerCitizenQueryEvent(caseId, RAISE_QUERY_EVENT, queryType, newMessage);
    return submittedMessage;
  },
  followUpOnLipQuery: async (caseId, user, initialQueryMessage, queryType) => {
    console.log(`Following up on query as: ${user.email}`);
    await apiRequest.setupTokens(user);
    const newMessage = await followUpQueryMessage(initialQueryMessage, apiRequest.getTokens().userId);
    return await triggerCitizenQueryEvent(caseId, RAISE_QUERY_EVENT, queryType, newMessage);
  },
};
