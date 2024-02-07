import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getTelephoneMediationTask} from 'common/utils/taskList/tasks/telephoneMediation';
import {Mediation} from 'models/mediation/mediation';
import {ClaimantResponse} from 'models/claimantResponse';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Telephone mediation', () => {
  let claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultComplete = {
    description: 'COMMON.TELEPHONE_MEDIATION',
    url: '/case/5129/mediation/telephone-mediation',
  };

  beforeEach(() => {
    claim = new Claim();
  });

  describe('getTelephoneMediationTask', () => {

    it('should return complete - defendant response', () => {
      claim.mediation = new Mediation();
      claim.mediation.hasTelephoneMeditationAccessed = true;
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, false);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete - defendant response', () => {
      claim.mediation = new Mediation();
      claim.mediation.hasTelephoneMeditationAccessed = false;
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, false);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is undefined - defendant response', () => {
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, false);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return complete - claimant response', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediation = new Mediation();
      claim.claimantResponse.mediation.hasTelephoneMeditationAccessed = true;
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, true);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete - claimant response', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediation = new Mediation();
      claim.claimantResponse.mediation.hasTelephoneMeditationAccessed = false;
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, true);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is undefined - claimant response', () => {
      const telephoneMediationTask = getTelephoneMediationTask(claim, claimId, lang, true);
      expect(telephoneMediationTask.url).toEqual(resultComplete.url);
      expect(telephoneMediationTask.description).toEqual(resultComplete.description);
      expect(telephoneMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });
  });
});
