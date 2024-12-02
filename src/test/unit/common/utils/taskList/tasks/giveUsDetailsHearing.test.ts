import {YesNo} from 'common/form/models/yesNo';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
  DETERMINATION_WITHOUT_HEARING_URL,
} from 'routes/urls';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {getGiveUsDetailsHearingTask} from 'common/utils/taskList/tasks/giveUsDetailsHearing';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('getGiveUsDetailsHearingTask', () => {
  const claimId = '5129';
  const lang = 'en';
  const smallClaimsDQUrl = constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL);
  const fastIntMultiTrackClaimsDQUrl = constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL);

  describe('Small Claims track DQ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 9000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
    });
    it('should return incomplete task when no directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = undefined;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(smallClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return other incomplete task with empty directionQuestionnaire', () => {
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(smallClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return complete task when all input provided', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      claim.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.specificCourtLocation = <SpecificCourtLocation>{};
      claim.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      claim.directionQuestionnaire.experts.expertRequired = false;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(smallClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.COMPLETE);
    });
  });

  describe('Fast track DQ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 16000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
    });
    it('should return incomplete task when no directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = undefined;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return other incomplete task with empty directionQuestionnaire', () => {
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return complete task when all input provided', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      claim.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.specificCourtLocation = <SpecificCourtLocation>{};
      claim.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      claim.directionQuestionnaire.experts.expertRequired = false;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, false);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });
  });

  describe('Intermediate track DQ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 26000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
    });
    it('should return incomplete task when no directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = undefined;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return other incomplete task with empty directionQuestionnaire', () => {
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return complete task when all input provided', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
      claim.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
      claim.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      claim.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.specificCourtLocation = <SpecificCourtLocation>{};
      claim.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.COMPLETE);
    });
  });

  describe('Multi track DQ', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.totalClaimAmount = 150000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
    });
    it('should return incomplete task when no directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = undefined;
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return other incomplete task with empty directionQuestionnaire', () => {
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should return complete task when all input provided', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
      claim.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
      claim.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      claim.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      claim.directionQuestionnaire.hearing.specificCourtLocation = <SpecificCourtLocation>{};
      claim.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};
      //When
      const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(claim, claimId, lang, true);
      //Then
      expect(giveUsDetailsHearingTask.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(giveUsDetailsHearingTask.url).toEqual(fastIntMultiTrackClaimsDQUrl);
      expect(giveUsDetailsHearingTask.status).toEqual(TaskStatus.COMPLETE);
    });
  });
});
