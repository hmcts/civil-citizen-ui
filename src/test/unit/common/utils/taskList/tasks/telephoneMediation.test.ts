import {Claim} from '../../../../../../main/common/models/claim';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getTelephoneMediationTask} from 'common/utils/taskList/tasks/telephoneMediation';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Telephone mediation', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultComplete = {
    description: 'COMMON.TELEPHONE_MEDIATION',
    url: '/case/5129/mediation/telephone-mediation',
    status: TaskStatus.COMPLETE,
  };

  describe('getTelephoneMediationTask', () => {

    //ToDo Update to test INCOMPLETE changing to COMPLETE
    it('should return complete', () => {
      const freeTelephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });
  });
});
