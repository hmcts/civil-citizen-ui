import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
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

    it('should return complete', () => {
      const freeTelephoneMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });
    it('should return incomplete', () => {
      const freeTelephoneMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });
  });
});
