import {TaskStatus} from 'models/taskList/TaskStatus';
import {getCheckAndSubmitYourResponseTask} from 'common/utils/taskList/tasks/checkAndSubmitYourResponse';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Check and submit your response Task', () => {
  const claimId = '5129';
  const lang = 'en';
  const expectedUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_CHECK_ANSWERS_URL);

  it('should return incomplete check task with correct description and url', () => {
    const task = getCheckAndSubmitYourResponseTask(claimId, lang);

    expect(task).toEqual({
      description: 'TASK_LIST.SUBMIT.CHECK_AND_SUBMIT',
      url: expectedUrl,
      status: TaskStatus.INCOMPLETE,
      isCheckTask: true,
    });
  });
});
