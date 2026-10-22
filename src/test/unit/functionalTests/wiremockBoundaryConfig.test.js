jest.mock('dotenv', () => ({config: jest.fn()}));
jest.mock('../../config', () => ({TestUrl: 'http://localhost'}));
jest.mock('../../functionalTests/plugins/failedAndNotExecutedTestFilesPlugin', () => ({testFilesHelper: {}}));
jest.mock('../../functionalTests/specClaimHelpers/api/caseRoleAssignmentHelper', () => ({unAssignAllUsers: jest.fn()}));
jest.mock('../../functionalTests/specClaimHelpers/api/idamHelper', () => ({deleteAllIdamTestUsers: jest.fn()}));

describe('WireMock helper selection', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it.each([
    ['optimised smoke', undefined, 'true', false],
    ['standard functional', 'true', 'false', false],
    ['optimised functional', 'true', 'true', true],
  ])('enables mock checks only for optimised functional tests: %s', (_name, functional, optimised, enabled) => {
    process.env = {...originalEnv, OPTIMISED_FUNCTIONAL_TESTS: optimised, WIREMOCK_URL: 'https://wiremock.example.test'};
    if (functional) process.env.FUNCTIONAL = functional;
    else delete process.env.FUNCTIONAL;
    const {config} = require('../../../../codecept.conf');
    expect(Boolean(config.helpers.WiremockBoundary)).toBe(enabled);
  });
});
