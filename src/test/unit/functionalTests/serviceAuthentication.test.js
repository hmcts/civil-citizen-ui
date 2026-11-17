jest.mock('../../config', () => ({
  url: {authProviderApi: 'http://auth.test', caseAssignmentService: 'http://assignment.test', civilService: 'http://civil.test', waTaskMgmtApi: 'http://tasks.test'},
  s2s: {microservice: 'civil-citizen-ui', secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'},
  s2sForXUI: {microservice: 'xui_webapp', secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'},
}));
jest.mock('../../functionalTests/specClaimHelpers/api/idamHelper', () => ({
  accessToken: jest.fn(async () => 'user-token'),
  userId: jest.fn(async () => 'user-id'),
}));
jest.mock('../../functionalTests/specClaimHelpers/api/restHelper', () => ({
  retriedRequest: jest.fn(), request: jest.fn(),
}));

const rest = require('../../functionalTests/specClaimHelpers/api/restHelper');
const api = require('../../functionalTests/specClaimHelpers/api/apiRequest');
const assignment = require('../../functionalTests/specClaimHelpers/api/caseAssignment');
const support = require('../../functionalTests/specClaimHelpers/api/testingSupport');

beforeEach(() => {
  jest.clearAllMocks();
  // RFC 6238 SHA-1 vector, reduced to the service's existing six digits.
  jest.spyOn(Date, 'now').mockReturnValue(59000);
  const response = {status: 200, text: async () => 'service-token', json: async () => ({tasks: [{type: 'test-task'}]})};
  rest.retriedRequest.mockResolvedValue(response);
  rest.request.mockResolvedValue(response);
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ['API tokens', () => api.setupTokens({}), 'civil-citizen-ui'],
  ['case assignment', () => assignment.getNocQuestions('123', {}), 'civil-citizen-ui'],
  ['unassignment', () => support.unAssignUserFromCases(['123'], {}), 'civil-citizen-ui'],
  ['case update', () => support.updateCaseData('123', {}, {}), 'civil-citizen-ui'],
  ['task action', () => api.taskActionByUser({}, 'task-id', 'claim'), 'xui_webapp'],
  ['task search', () => api.fetchTaskDetails({}, '123', 'test-task'), 'xui_webapp'],
])('%s sends the resolved OTP string and correct service identity', async (_name, call, microservice) => {
  await call();
  const leases = rest.retriedRequest.mock.calls.filter(([url]) => url === 'http://auth.test/lease');
  expect(leases).toHaveLength(1);
  expect(leases[0]).toEqual([
    'http://auth.test/lease', {'Content-Type': 'application/json'},
    {microservice, oneTimePassword: '287082'},
  ]);
});
