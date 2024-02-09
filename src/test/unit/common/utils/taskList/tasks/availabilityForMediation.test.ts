import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, MEDIATION_PHONE_CONFIRMATION_URL} from 'routes/urls';
import {Party} from 'models/party';
import {MediationCarm} from 'models/mediation/mediationCarm';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Availability for mediation', () => {
  let claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultCompleteCompanyYes = {
    description: 'COMMON.AVAILABILITY_FOR_MEDIATION',
    url: constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL),
  };
  const resultCompleteCompanyNo = {
    description: 'COMMON.AVAILABILITY_FOR_MEDIATION',
    url:constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL),
  };

  beforeEach(() => {
    claim = new Claim();
    claim.respondent1 = new Party();
  });

  describe('getAvailabilityForMediationTask', () => {

    it('should return complete when defendant is company', () => {
      claim.respondent1.type = PartyType.COMPANY;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return complete when defendant is not company', () => {
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete when defendant is company', () => {
      claim.respondent1.type = PartyType.COMPANY;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when defendant is not company', () => {
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    /*    it('should return incomplete when is undefined', () => {
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });*/
  });
});
