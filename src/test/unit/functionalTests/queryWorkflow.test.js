jest.mock('../../functionalTests/specClaimHelpers/api/apiRequest', () => ({
  setupTokens: jest.fn(),
  getTokens: jest.fn(() => ({userId: 'caseworker'})),
  startEvent: jest.fn(),
  submitEvent: jest.fn(),
  fetchCaseDetailsAsSystemUser: jest.fn(),
  startEventForCitizen: jest.fn(),
}));
jest.mock('../../functionalTests/specClaimHelpers/api/testingSupport', () => ({waitForFinishedBusinessProcess: jest.fn()}));
jest.mock('../../functionalTests/specClaimHelpers/fixtures/queryMessages', () => ({queryResponseMessage: jest.fn(), initialQueryMessage: jest.fn()}));

const api = require('../../functionalTests/specClaimHelpers/api/apiRequest');
const {waitForFinishedBusinessProcess} = require('../../functionalTests/specClaimHelpers/api/testingSupport');
const {queryResponseMessage, initialQueryMessage} = require('../../functionalTests/specClaimHelpers/fixtures/queryMessages');
const {respondToQuery, raiseLipQuery} = require('../../functionalTests/specClaimHelpers/api/steps_qm');

const queryType = {collectionField: 'queries', partyName: 'All queries'};
const user = {email: 'caseworker@example.test'};

beforeEach(() => {
  jest.resetAllMocks();
  api.getTokens.mockReturnValue({userId: 'caseworker'});
  api.startEvent.mockResolvedValue({});
  api.submitEvent.mockImplementation(async (_event, payload) => ({json: async () => ({case_data: payload})}));
  queryResponseMessage.mockResolvedValue({value: {
    id: 'response', createdOn: '2026-01-01T00:00:00.000Z', createdBy: 'caseworker', body: 'Query closed',
  }});
});

it('waits for a browser follow-up before reading case data and raising a citizen query', async () => {
  let finishWorkflow;
  let waiting;
  const waitStarted = new Promise(resolve => { waiting = resolve; });
  waitForFinishedBusinessProcess.mockImplementationOnce(() => {
    waiting();
    return new Promise(resolve => { finishWorkflow = resolve; });
  });
  const message = {value: {
    id: 'query', createdOn: '2026-01-01T00:00:00.000Z', createdBy: 'citizen', body: 'New query',
  }};
  initialQueryMessage.mockResolvedValue(message);
  api.fetchCaseDetailsAsSystemUser.mockResolvedValue({case_data: {}});
  api.startEventForCitizen.mockImplementation(async (_event, _caseId, payload) => payload.caseDataUpdate);
  const response = raiseLipQuery('case-123', {type: 'defendant', email: 'citizen@example.test'}, queryType);
  await waitStarted;
  expect(api.fetchCaseDetailsAsSystemUser).not.toHaveBeenCalled();
  expect(api.startEventForCitizen).not.toHaveBeenCalled();

  finishWorkflow();
  await expect(response).resolves.toMatchObject({id: 'query', body: 'New query'});
  expect(api.startEventForCitizen).toHaveBeenCalledWith('queryManagementRaiseQuery', 'case-123', {
    event: 'queryManagementRaiseQuery', caseDataUpdate: {queries: {partyName: 'All queries', caseMessages: [message]}},
  });
  expect(waitForFinishedBusinessProcess).toHaveBeenNthCalledWith(1, 'case-123');
  expect(waitForFinishedBusinessProcess).toHaveBeenNthCalledWith(2, 'case-123');
});

it('does not raise a citizen query after a workflow incident', async () => {
  waitForFinishedBusinessProcess.mockRejectedValue(new Error('Workflow incident'));
  await expect(raiseLipQuery('case-123', {type: 'defendant'}, queryType)).rejects.toThrow('Workflow incident');
  expect(api.fetchCaseDetailsAsSystemUser).not.toHaveBeenCalled();
  expect(api.startEventForCitizen).not.toHaveBeenCalled();
});

it('does not start a caseworker event while a browser follow-up workflow is pending', async () => {
  let finishWorkflow;
  let waiting;
  const waitStarted = new Promise(resolve => { waiting = resolve; });
  waitForFinishedBusinessProcess.mockImplementationOnce(() => {
    waiting();
    return new Promise(resolve => { finishWorkflow = resolve; });
  });
  const response = respondToQuery('case-123', user, {}, queryType, true);
  await waitStarted;
  expect(api.startEvent).not.toHaveBeenCalled();
  expect(api.submitEvent).not.toHaveBeenCalled();

  finishWorkflow();
  await expect(response).resolves.toMatchObject({id: 'response', body: 'Query closed'});
  expect(api.startEvent).toHaveBeenCalledWith('queryManagementRespondQuery', 'case-123');
  expect(waitForFinishedBusinessProcess).toHaveBeenNthCalledWith(1, 'case-123');
  expect(waitForFinishedBusinessProcess).toHaveBeenNthCalledWith(2, 'case-123');
});

it('propagates a failed prior workflow without attempting the next event', async () => {
  waitForFinishedBusinessProcess.mockRejectedValue(new Error('Workflow incident'));
  await expect(respondToQuery('case-123', user, {}, queryType, true)).rejects.toThrow('Workflow incident');
  expect(api.startEvent).not.toHaveBeenCalled();
  expect(api.submitEvent).not.toHaveBeenCalled();
});
