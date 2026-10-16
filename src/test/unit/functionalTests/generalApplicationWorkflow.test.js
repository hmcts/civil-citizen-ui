jest.mock('../../functionalTests/citizenFeatures/common/contactUs', () => jest.fn());
jest.mock('../../config', () => ({TestUrl: 'http://localhost', systemUpdate: {email: 'system@example.test'}}));
jest.mock('../../functionalTests/specClaimHelpers/api/apiRequest', () => ({fetchCaseDetails: jest.fn()}));
jest.mock('../../functionalTests/specClaimHelpers/api/testingSupport', () => ({waitForGAFinishedBusinessProcess: jest.fn()}));

const actions = {grabAttributeFrom: jest.fn(), click: jest.fn()};
const originalActor = global.actor;
global.actor = () => actions;
const ConfirmationPage = require('../../functionalTests/citizenFeatures/GA/pages/submitGAConfirmation');
const api = require('../../functionalTests/specClaimHelpers/api/apiRequest');
const {waitForGAFinishedBusinessProcess} = require('../../functionalTests/specClaimHelpers/api/testingSupport');
const page = new ConfirmationPage();

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
  actions.grabAttributeFrom.mockResolvedValue('/case/123/general-application/apply-help-fee-selection?id=selected');
});
afterEach(() => jest.useRealTimers());
afterAll(() => { global.actor = originalActor; });

it('waits for the selected GA case and its workflow before starting payment', async () => {
  api.fetchCaseDetails.mockResolvedValueOnce({case_data: {}}).mockResolvedValue({case_data: {generalApplications: [
    {id: 'other', value: {caseLink: {CaseReference: '456'}}},
    {id: 'selected', value: {caseLink: {CaseReference: '789'}}},
  ]}});
  let finishWorkflow;
  waitForGAFinishedBusinessProcess.mockImplementation(() => new Promise(resolve => { finishWorkflow = resolve; }));
  const payment = page.nextAction('Pay application fee');
  await jest.advanceTimersByTimeAsync(4000);
  expect(api.fetchCaseDetails).toHaveBeenCalledTimes(2);
  expect(waitForGAFinishedBusinessProcess).toHaveBeenCalledWith('789', {email: 'system@example.test'});
  expect(actions.click).not.toHaveBeenCalled();
  finishWorkflow();
  await payment;
  expect(actions.click).toHaveBeenCalledWith('Pay application fee');
});

it('does not start payment after a workflow incident', async () => {
  api.fetchCaseDetails.mockResolvedValue({case_data: {generalApplications: [
    {id: 'selected', value: {caseLink: {CaseReference: '789'}}},
  ]}});
  waitForGAFinishedBusinessProcess.mockRejectedValue(new Error('Workflow incident'));
  await expect(page.nextAction('Pay application fee')).rejects.toThrow('Workflow incident');
  expect(actions.click).not.toHaveBeenCalled();
});

it('leaves other confirmation actions available without a payment wait', async () => {
  await page.nextAction('Close and return to case details');
  expect(api.fetchCaseDetails).not.toHaveBeenCalled();
  expect(actions.click).toHaveBeenCalledWith('Close and return to case details');
});
