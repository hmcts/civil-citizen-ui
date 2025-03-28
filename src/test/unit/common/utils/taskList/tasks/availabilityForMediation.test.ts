import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, MEDIATION_PHONE_CONFIRMATION_URL} from 'routes/urls';
import {Party} from 'models/party';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {ClaimantResponse} from 'models/claimantResponse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';

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
    claim.applicant1 = new Party();
  });

  describe('getAvailabilityForMediationTask', () => {

    it('should return complete when defendant is company', () => {
      claim.respondent1.type = PartyType.COMPANY;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return complete when defendant is not company', () => {
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete when defendant is company', () => {
      claim.respondent1.type = PartyType.COMPANY;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when defendant is not company', () => {
      claim.respondent1.type = PartyType.INDIVIDUAL;
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is isMediationPhoneCorrect is NO and alternativePhone is undefined', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('no');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is isMediationPhoneCorrect is YES', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('YES');
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is isMediationEmailCorrect is NO and alternativeEmail is undefined', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.mediationCarm.isMediationEmailCorrect = new GenericYesNo('no');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
      expect(claim.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is isMediationEmailCorrect is YES', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.mediationCarm.hasAvailabilityMediationFinished).toBeTruthy();
    });

    it('should return incomplete when is hasUnavailabilityNextThreeMonths is YES and unavailableDatesForMediation is undefined', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.mediationCarm.hasUnavailabilityNextThreeMonths = new GenericYesNo('yes');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
      expect(claim.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is hasUnavailabilityNextThreeMonths is NO', () => {
      claim.mediationCarm = new MediationCarm();
      claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.mediationCarm.hasUnavailabilityNextThreeMonths = new GenericYesNo('NO');
      claim.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, false);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.mediationCarm.hasAvailabilityMediationFinished).toBeTruthy();
    });

    it('should return complete when claimant is company', () => {
      claim.applicant1.type = PartyType.COMPANY;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return complete when claimant is not company', () => {
      claim.applicant1.type = PartyType.INDIVIDUAL;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
    });

    it('should return incomplete when claimant is company', () => {
      claim.applicant1.type = PartyType.COMPANY;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyYes.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyYes.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when claimant is not company', () => {
      claim.applicant1.type = PartyType.INDIVIDUAL;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = false;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return incomplete when is isMediationPhoneCorrect is NO and alternativePhone is undefined', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('no');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is isMediationPhoneCorrect is YES', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeTruthy();
    });

    it('should return incomplete when is isMediationEmailCorrect is NO and alternativeEmail is undefined', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.isMediationEmailCorrect = new GenericYesNo('no');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is isMediationEmailCorrect is YES', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeTruthy();
    });

    it('should return incomplete when is hasUnavailabilityNextThreeMonths is YES and unavailableDatesForMediation is undefined', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.hasUnavailabilityNextThreeMonths = new GenericYesNo('yes');
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.INCOMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeFalsy();
    });

    it('should return incomplete when is hasUnavailabilityNextThreeMonths is NO', () => {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediationCarm = new MediationCarm();
      claim.claimantResponse.mediationCarm.isMediationPhoneCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.isMediationEmailCorrect = new GenericYesNo('yes');
      claim.claimantResponse.mediationCarm.hasUnavailabilityNextThreeMonths = new GenericYesNo('no');
      claim.claimantResponse.mediationCarm.unavailableDatesForMediation = new UnavailableDatesMediation();
      claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished = true;
      const availabilityForMediationTask = getAvailabilityForMediationTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultCompleteCompanyNo.url);
      expect(availabilityForMediationTask.description).toEqual(resultCompleteCompanyNo.description);
      expect(availabilityForMediationTask.status).toEqual(TaskStatus.COMPLETE);
      expect(claim.claimantResponse.mediationCarm.hasAvailabilityMediationFinished).toBeTruthy();
    });

  });
});
