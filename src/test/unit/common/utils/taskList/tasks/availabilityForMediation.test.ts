import {Claim} from '../../../../../../main/common/models/claim';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Availability for mediation', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultComplete = {
    description: 'COMMON.AVAILABILITY_FOR_MEDIATION',
    url: '/case/5129/response/availability-for-mediation',
    status: TaskStatus.COMPLETE,
  };

  describe('getAvailabilityForMediationTask', () => {

    //ToDo Update to test INCOMPLETE changing to COMPLETE
    it('should return complete', () => {
      const freeTelephoneMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });
  });
});
