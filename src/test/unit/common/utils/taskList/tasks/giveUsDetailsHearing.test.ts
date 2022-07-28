import {Claim} from '../../../../../../main/common/models/claim';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getGiveUsDetailsHearingTask} from '../../../../../../main/common/utils/taskList/tasks/giveUsDetailsHearing';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('When will you pay Task', () => {
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS',
    url: '/case/5129/directions-questionnaire/support-required',
    status: TaskStatus.COMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getGiveUsDetailsHearingTask', () => {

    it('should return incomplete task', () => {
      const claim = new Claim();
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang);
      expect(giveUsDetailsHearingTask).toEqual(resultComplete);
    });

  });

});
