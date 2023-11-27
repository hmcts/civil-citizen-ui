import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';
import {Mediation} from 'models/mediation/mediation';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Availability for mediation', () => {
  let claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultComplete = {
    description: 'COMMON.AVAILABILITY_FOR_MEDIATION',
    url: '/case/5129/response/availability-for-mediation',
  };

  beforeEach(() => {
    claim = new Claim();
  });

  describe('getAvailabilityForMediationTask', () => {

    it('should return complete', () => {
      claim.mediation = new Mediation();
      claim.mediation.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete', () => {
      claim.mediation = new Mediation();
      claim.mediation.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is undefined', () => {
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });
  });
});
