import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {
  getClaimantMediationAvailabilityTask,
  getClaimantTelephoneMediationTask
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/mediationSectionTasks';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Mediation section task', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  describe('getClaimantTelephoneMediationTask', () => {

    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.MEDIATION.TELEPHONE_MEDIATION',
      url: '/case/5129/claimant-response/mediation/telephone-mediation',
      status: TaskStatus.INCOMPLETE,
    };

    // const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

    it('should return incomplete', () => {
      //When
      const telephoneMediationTask = getClaimantTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(telephoneMediationTask).toEqual(resultIncomplete);
    });
    // todo completed task test for civ-11283
  });

  describe('getClaimantMediationAvailabilityTask', () => {

    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.MEDIATION.MEDIATION_AVAILABILITY',
      url: '/case/5129/claimant-response/mediation/availability',
      status: TaskStatus.INCOMPLETE,
    };

    // const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

    it('should return incomplete', () => {
      //When
      const availabilityTask = getClaimantMediationAvailabilityTask(claim, claimId, lang);
      //Then
      expect(availabilityTask).toEqual(resultIncomplete);
    });
    // todo completed task test for civ-11281
  });
});
