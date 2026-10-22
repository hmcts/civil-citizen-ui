import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getChooseAResponseTask} from 'common/utils/taskList/tasks/chooseAResponse';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CITIZEN_RESPONSE_TYPE_URL} from 'routes/urls';
import {isCaseDataMissing, isResponseTypeMissing} from 'common/utils/taskList/tasks/taskListHelpers';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/common/utils/taskList/tasks/taskListHelpers');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const isCaseDataMissingMock = isCaseDataMissing as jest.Mock;
const isResponseTypeMissingMock = isResponseTypeMissing as jest.Mock;

describe('Choose a response Task', () => {
  const claimId = '5129';
  const lang = 'en';
  const expectedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return complete when case data and response type are present', () => {
    isCaseDataMissingMock.mockReturnValue(false);
    isResponseTypeMissingMock.mockReturnValue(false);

    const claim = new Claim();
    claim.respondent1 = new Party();
    const task = getChooseAResponseTask(claim, claimId, lang);

    expect(task).toEqual({
      description: 'TASK_LIST.RESPOND_TO_CLAIM.CHOOSE_A_RESPONSE',
      url: expectedUrl,
      status: TaskStatus.COMPLETE,
    });
  });

  it('should return incomplete when case data is missing', () => {
    isCaseDataMissingMock.mockReturnValue(true);
    isResponseTypeMissingMock.mockReturnValue(false);

    const task = getChooseAResponseTask(new Claim(), claimId, lang);

    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
    expect(task.url).toEqual(expectedUrl);
  });

  it('should return incomplete when response type is missing', () => {
    isCaseDataMissingMock.mockReturnValue(false);
    isResponseTypeMissingMock.mockReturnValue(true);

    const claim = new Claim();
    claim.respondent1 = new Party();
    const task = getChooseAResponseTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
    expect(task.url).toEqual(expectedUrl);
  });
});
