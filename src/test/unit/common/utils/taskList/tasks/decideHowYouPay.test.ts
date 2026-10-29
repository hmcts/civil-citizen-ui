import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getDecideHowYouPayTask} from 'common/utils/taskList/tasks/decideHowYouPay';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CITIZEN_PAYMENT_OPTION_URL} from 'routes/urls';
import {isPaymentOptionMissing} from 'common/utils/taskList/tasks/taskListHelpers';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/common/utils/taskList/tasks/taskListHelpers');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const isPaymentOptionMissingMock = isPaymentOptionMissing as jest.Mock;

describe('Decide how you pay Task', () => {
  const claimId = '5129';
  const lang = 'en';
  const expectedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return complete when payment option is present', () => {
    isPaymentOptionMissingMock.mockReturnValue(false);
    const task = getDecideHowYouPayTask(new Claim(), claimId, lang);
    expect(task).toEqual({
      description: 'TASK_LIST.RESPOND_TO_CLAIM.DECIDE_HOW_YOU_WILL_PAYS',
      url: expectedUrl,
      status: TaskStatus.COMPLETE,
    });
  });

  it('should return incomplete when payment option is missing', () => {
    isPaymentOptionMissingMock.mockReturnValue(true);
    const task = getDecideHowYouPayTask(new Claim(), claimId, lang);
    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
    expect(task.url).toEqual(expectedUrl);
  });
});
