import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {YesNo} from 'common/form/models/yesNo';
import {
  VulnerabilityQuestions,
} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {t} from 'i18next';
import {
  addSupportRequiredList,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/addSupportRequiredList';
import {summarySection} from 'models/summaryList/summarySections';
import {OtherWitnessItems} from 'common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {OtherWitnesses} from 'models/directionsQuestionnaire/witnesses/otherWitnesses';
import {
  UnavailableDatePeriod,
  UnavailableDateType,
} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {getClaimWithDirectionQuestionnaireAndHearing} from './buildFastTrackHearingRequirements.test';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {
  displaySpecificCourtLocation,
  displayUnavailabilityForHearing,
  documentsLanguagePreference, getSpecificCourtLocation,
  getSummaryRowForDisplayEvidenceYourself, getUnavailabilityReason, getUnavailableDatesList,
  getWitnesses,
  phoneAndVideoInfo,
  phoneAndVideoQuestion,
  speakingLanguagePreference,
  vulnerabilityInfo,
  vulnerabilityQuestion,
} from 'services/features/common/buildCommonHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const witness1 = new OtherWitnessItems({
  firstName: 'Joe',
  lastName: 'Doe',
  telephone: '000000000',
  email: 'joe@doe.com',
  details: 'Here is some of details',
});

const witness2 = new OtherWitnessItems({
  firstName: 'Jane',
  lastName: 'Does',
  telephone: '111111111',
  email: 'jane@does.com',
  details: 'Some details of Jane Does',
});

describe('Common Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('speakingLanguagePreference', () => {

    it('should return summaryRow if language preference is english', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.ENGLISH',
      );
      //Then
      expect(speakingLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is welsh', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.WELSH,
        documentsLanguage: LanguageOptions.ENGLISH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.WELSH',
      );
      //Then
      expect(speakingLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is english and welsh', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.WELSH_AND_ENGLISH,
        documentsLanguage: LanguageOptions.ENGLISH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH',
      );
      //Then
      expect(speakingLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is not provided', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.WELSH_AND_ENGLISH,
        documentsLanguage: LanguageOptions.ENGLISH,
      };
      const claimCopy = Object.assign(claim);
      claimCopy.directionQuestionnaire.welshLanguageRequirements.language.speakLanguage = undefined;
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        '',
      );
      //Then
      expect(speakingLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });
  });

  describe('documentsLanguagePreference', () => {
    it('should return summaryRow if document language preference is english', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.WELSH,
        documentsLanguage: LanguageOptions.ENGLISH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.ENGLISH',
      );
      //Then
      expect(documentsLanguagePreference(lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is welsh', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.WELSH',
      );
      //Then
      expect(documentsLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is not provided', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.WELSH_AND_ENGLISH,
        documentsLanguage: LanguageOptions.ENGLISH,
      };
      const claimCopy = Object.assign(claim);
      claimCopy.directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage = undefined;
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        '',
      );
      //Then
      expect(documentsLanguagePreference( lng, claimCopy.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is english and welsh', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
      };
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH',
      );
      //Then
      expect(documentsLanguagePreference( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });
  });

  describe('giveEvidenceYourself', () => {
    it('should return summaryRow if give evidence yourself option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE',
        'COMMON.VARIATION_2.NO',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(getSummaryRowForDisplayEvidenceYourself(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if give evidence yourself option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE',
        'COMMON.VARIATION_2.YES',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(getSummaryRowForDisplayEvidenceYourself(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('vulnerabilityQuestion', () => {
    it('should return summaryRow if vulnerability question option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'COMMON.VARIATION_2.NO',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityQuestion(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability question option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'COMMON.VARIATION_2.YES',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityQuestion(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('vulnerabilityInfo', () => {
    it('should return summaryRow if vulnerability details is set', () => {
      //Given
      const vulnerabilityDetails = 'Test vulnerability details';
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {vulnerabilityDetails};
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO',
        vulnerabilityDetails,
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityInfo(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability details is not set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO',
        '',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityInfo(claim.directionQuestionnaire, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('addSupportRequiredList', () => {
    it('should return summaryRow if supportRequiredList option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.supportRequiredList = {
        option: YesNo.NO,
      };
      const hearingRequirementsSection = summarySection({
        title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
        summaryRows: [],
      });
      const mockSummarySection = summaryRow(
        'PAGES.SUPPORT_REQUIRED.TITLE',
        t('COMMON.VARIATION_3.NO'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );
      //When
      addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      //Then
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if supportRequiredList option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.supportRequiredList = {
        option: YesNo.YES,
        items: [
          {fullName: 'John Doe'},
        ],
      };
      const hearingRequirementsSection = summarySection({
        title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
        summaryRows: [],
      });
      const mockSummarySection = summaryRow(
        'PAGES.SUPPORT_REQUIRED.TITLE',
        t('COMMON.VARIATION_3.YES'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );
      //When
      addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      //Then
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });
  });

  describe('test getWithnesses', () => {
    it('should display \'no\' when there are no witnesses', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [];
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.NO;

      //When
      const summaryRows = getWitnesses(claim.directionQuestionnaire, '1', 'eng');
      //Then
      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual('COMMON.NO');
    });

    it('should display \'yes\' and 1 witness details', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1];

      //When
      const summaryRows = getWitnesses(claim.directionQuestionnaire, '1', 'eng');
      //Then
      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual('COMMON.YES');

      expect(summaryRows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');

      expect(summaryRows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[2].value.html).toEqual(witness1.firstName);

      expect(summaryRows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[3].value.html).toEqual(witness1.lastName);

      expect(summaryRows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[4].value.html).toEqual(witness1.email);

      expect(summaryRows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[5].value.html).toEqual(witness1.telephone);

      expect(summaryRows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[6].value.html).toEqual(witness1.details);

    });

    it('should display \'yes\' and have 2 witnesses', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1, witness2];

      //When
      const summaryRows = getWitnesses(claim.directionQuestionnaire, '1', 'eng');

      //Then
      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual('COMMON.YES');
      // Witness 1
      expect(summaryRows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');
      expect(summaryRows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[2].value.html).toEqual(witness1.firstName);
      expect(summaryRows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[3].value.html).toEqual(witness1.lastName);
      expect(summaryRows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[4].value.html).toEqual(witness1.email);
      expect(summaryRows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[5].value.html).toEqual(witness1.telephone);
      expect(summaryRows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[6].value.html).toEqual(witness1.details);
      // Witness 2
      expect(summaryRows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 2');
      expect(summaryRows[8].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[8].value.html).toEqual(witness2.firstName);
      expect(summaryRows[9].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[9].value.html).toEqual(witness2.lastName);
      expect(summaryRows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[10].value.html).toEqual(witness2.email);
      expect(summaryRows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[11].value.html).toEqual(witness2.telephone);
      expect(summaryRows[12].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[12].value.html).toEqual(witness2.details);
    });
  });

  describe('phone or Video hearing question', () => {
    it('should return summaryRow if phone or video hearing question option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING',
        'COMMON.VARIATION_2.NO',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );
      //Then
      expect(phoneAndVideoQuestion( claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if phone or video hearing question option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING',
        'COMMON.VARIATION_2.YES',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );
      //Then
      expect(phoneAndVideoQuestion( claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

  });

  describe('phone or Video hearing details', () => {
    it('should return summaryRow if phone or video hearing question option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'Test reason.',
      };
      //Then
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING',
        'Test reason.',
      );
      //Then
      expect(phoneAndVideoInfo( lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });
  });

  describe('should return summary rows relative to unavailable date for hearing', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = getClaimWithDirectionQuestionnaireAndHearing();
    });
    it('should display NO if defendant select NO on question expert or witnesses cannot go to hearing ', () => {
      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = new GenericYesNo(YesNo.NO);
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton,
      );
      //GIVEN
      const defendantUnavailableDate =
        displayUnavailabilityForHearing( claimId, lng, claim.directionQuestionnaire);
      // THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);
    });

    it('should display YES if defendant select YES on question expert or witnesses cannot go to hearing ', () => {
      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
        'COMMON.YES',
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton,
      );
      //GIVEN
      const defendantUnavailableDate =
        displayUnavailabilityForHearing( claimId, lng, claim.directionQuestionnaire);
      //THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);
    });

    it('should  display unavailable single date if defendant YES ', () => {
      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = <GenericYesNo>{option: YesNo.YES};
      const date = new Date('2023-12-30T00:00:00.000Z');
      const singleDateMockData: UnavailableDatePeriod = {
        from: date,
        startYear: date.getFullYear(),
        startMonth: date.getMonth(),
        startDay: date.getDate(),
        endYear: null,
        endMonth: null,
        endDay: null,
        type: UnavailableDateType.SINGLE_DATE,
      };
      claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
        items: [singleDateMockData],
      };
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES',
        ' 30 December 2023',
        '/case/validClaimId/directions-questionnaire/availability-dates',
        changeButton,
      );
      //GIVEN
      const defendantUnavailableDate =
        getUnavailableDatesList( claimId, lng, claim.directionQuestionnaire);
      //THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);
    });

    it('should  display unavailable range of date if defendant YES ', () => {
      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      const dateOne = new Date('2023-12-10T00:00:00.000Z');
      const dateTwo = new Date('2023-12-14T00:00:00.000Z');
      const longerPeriod4DaysOverlapMockData: UnavailableDatePeriod = {
        from: dateOne,
        until: dateTwo,
        startYear: dateOne.getFullYear(),
        startMonth: dateOne.getMonth(),
        startDay: dateOne.getDay(),
        endYear: dateTwo.getFullYear(),
        endMonth: dateTwo.getMonth(),
        endDay: dateTwo.getDay(),
        type: UnavailableDateType.LONGER_PERIOD,
      };
      claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
        items: [longerPeriod4DaysOverlapMockData],
      };
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES',
        ' 10 December 2023<br>11 December 2023<br>12 December 2023<br>13 December 2023<br>14 December 2023',
        '/case/validClaimId/directions-questionnaire/availability-dates',
        changeButton,
      );
      //GIVEN
      const defendantUnavailableDates =
        getUnavailableDatesList( claimId, lng, claim.directionQuestionnaire);
      //THEN
      expect(defendantUnavailableDates).toStrictEqual(mockSummarySection);
    });

    describe('Should display if the number of dates unavailable was greater than 30 ', () => {
      let claim: Claim;
      beforeEach(() => {
        claim = getClaimWithDirectionQuestionnaireAndHearing();
      });
      const dateOne = new Date('2023-10-10T00:00:00.000Z');
      const dateTwo = new Date('2023-12-14T00:00:00.000Z');
      const longerPeriod4DaysOverlapMockData: UnavailableDatePeriod = {
        from: dateOne,
        until: dateTwo,
        startYear: dateOne.getFullYear(),
        startMonth: dateOne.getMonth(),
        startDay: dateOne.getDay(),
        endYear: dateTwo.getFullYear(),
        endMonth: dateTwo.getMonth(),
        endDay: dateTwo.getDay(),
        type: UnavailableDateType.LONGER_PERIOD,
      };
      it('should display Why are you unavailable with the number of days ', () => {
        //WHEN
        claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
          items: [longerPeriod4DaysOverlapMockData],
        };
        claim.directionQuestionnaire.hearing.whyUnavailableForHearing = {reason: 'I will be out the country'};
        const mockSummarySection = summaryRow(
          'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS',
          'I will be out the country',
          '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
          changeButton,
        );
        // GIVEN
        const unavailableHearingDays =
          getUnavailabilityReason(claimId, 10, lng, claim.directionQuestionnaire);
        //THEN
        expect(unavailableHearingDays).toStrictEqual(mockSummarySection);
      });

      it('should display the reason if the number of dates unavailable was greater than 30 ', () => {
        //WHEN
        claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
          items: [longerPeriod4DaysOverlapMockData],
        };
        claim.directionQuestionnaire.hearing.whyUnavailableForHearing = {reason: 'I will be out the country'};
        const mockSummarySection = summaryRow(
          'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS',
          'I will be out the country',
          '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
          changeButton,
        );
        // GIVEN
        const unavailableHearingDays =
          getUnavailabilityReason( claimId, 20, lng, claim.directionQuestionnaire);
        //THEN
        expect(unavailableHearingDays).toStrictEqual(mockSummarySection);
      });
    });
  });

  describe('should return summary rows relative to court location defendant choice on the day of hearing', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = getClaimWithDirectionQuestionnaireAndHearing();
    });
    const courtLocations = [{
      code: '28b3277a-92f8-4e6b-a8b5-78c5de5c9a7a',
      label: "Barnet Civil and Family Centre - ST MARY'S COURT, REGENTS PARK ROAD - N3 1BQ",
    }];
    it('should display NO if the defendant does not have a preference for hearing court location', function () {
      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation(YesNo.NO, courtLocations[0].label, 'reason');
      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.TITLE',
        'COMMON.VARIATION_2.NO',
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton,
      );
      //WHEN
      const specificCourtLocation: SummaryRow =
        getSpecificCourtLocation(claimId, lng, claim.directionQuestionnaire);
      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });
    it('should display YES if the defendant does have a preference for hearing court location', function () {
      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation(YesNo.YES, courtLocations[0].label, 'reason');
      //WHEN
      const specificCourtLocation: SummaryRow =
        getSpecificCourtLocation( claimId, lng, claim.directionQuestionnaire);
      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.TITLE',
        'COMMON.VARIATION_2.YES',
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton,
      );
      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });
    it('should display selection as empty if there is no hearing object', function () {
      //GIVEN
      const claimWithNoHearing = new Claim();
      //WHEN
      const specificCourtLocation: SummaryRow =
        getSpecificCourtLocation( claimId, lng, claimWithNoHearing.directionQuestionnaire);
      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.TITLE',
        '',
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton,
      );
      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });

    it('should display court location if the defendant does have a preference for  hearing', function () {
      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation =
        new SpecificCourtLocation(YesNo.YES, courtLocations[0].label, 'reason');
      //WHEN
      const specificCourtLocation: SummaryRow =
        displaySpecificCourtLocation( claimId, lng, claim.directionQuestionnaire);
      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.SELECTED_COURT',
        courtLocations[0].label,
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton,
      );
      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });
  });
});
