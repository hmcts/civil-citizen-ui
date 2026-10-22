import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getShareFinancialDetailsTask} from 'common/utils/taskList/tasks/shareFinancialDetails';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {FINANCIAL_DETAILS_URL} from 'routes/urls';
import {
  financialDetailsShared,
  isCounterpartyCompany,
  isIndividualWithStatementOfMeansComplete,
} from 'common/utils/taskList/tasks/taskListHelpers';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/common/utils/taskList/tasks/taskListHelpers');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const financialDetailsSharedMock = financialDetailsShared as jest.Mock;
const isIndividualWithStatementOfMeansCompleteMock = isIndividualWithStatementOfMeansComplete as jest.Mock;
const isCounterpartyCompanyMock = isCounterpartyCompany as jest.Mock;

describe('Share financial details Task', () => {
  const claimId = '5129';
  const lang = 'en';
  const expectedUrl = constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL);

  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
    claim.respondent1 = new Party();
    jest.clearAllMocks();
  });

  it('should return incomplete when financial details are not shared', () => {
    financialDetailsSharedMock.mockReturnValue(false);
    isIndividualWithStatementOfMeansCompleteMock.mockReturnValue(true);
    isCounterpartyCompanyMock.mockReturnValue(false);

    const task = getShareFinancialDetailsTask(claim, claimId, lang);

    expect(task).toEqual({
      description: 'TASK_LIST.RESPOND_TO_CLAIM.SHARE_YOUR_FINANCIAL_DETAILS',
      url: expectedUrl,
      status: TaskStatus.INCOMPLETE,
    });
  });

  it('should return complete when shared and individual SoM is complete', () => {
    financialDetailsSharedMock.mockReturnValue(true);
    isIndividualWithStatementOfMeansCompleteMock.mockReturnValue(true);
    isCounterpartyCompanyMock.mockReturnValue(false);

    const task = getShareFinancialDetailsTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual(expectedUrl);
  });

  it('should return complete when shared and counterparty is company', () => {
    financialDetailsSharedMock.mockReturnValue(true);
    isIndividualWithStatementOfMeansCompleteMock.mockReturnValue(false);
    isCounterpartyCompanyMock.mockReturnValue(true);

    const task = getShareFinancialDetailsTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
  });

  it('should remain incomplete when shared but neither individual SoM nor company', () => {
    financialDetailsSharedMock.mockReturnValue(true);
    isIndividualWithStatementOfMeansCompleteMock.mockReturnValue(false);
    isCounterpartyCompanyMock.mockReturnValue(false);

    const task = getShareFinancialDetailsTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
  });
});
