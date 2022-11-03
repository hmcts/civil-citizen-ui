import {Claim} from '../../../../../../../main/common/models/claim';
import {
  DirectionQuestionnaire,
} from '../../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from '../../../../../../../main/common/models/directionsQuestionnaire/hearing/hearing';
import * as hearingRequirementsSection from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
import * as supportRequiredList from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/addSupportRequiredList';
import {summaryRow} from '../../../../../../../main/common/models/summaryList/summaryList';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {
  WelshLanguageRequirements,
} from '../../../../../../../main/common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from '../../../../../../../main/common/models/directionsQuestionnaire/languageOptions';
import {
  VulnerabilityQuestions,
} from '../../../../../../../main/common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {summarySection} from '../../../../../../../main/common/models/summaryList/summarySections';
import {t} from 'i18next';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('determinationWithoutHearingQuestion', () => {
    it('should return summaryRow if determination without hearing option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
      };
      //When
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'No',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };
      //When
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'Yes',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('determinationWithoutHearingReason', () => {
    it('should return summaryRow if determination without hearing reason is set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        reasonForHearing: 'my reason',
      };
      //When
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        'my reason',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing reason is not set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {};
      //When
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        '',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.ENGLISH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.WELSH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        'PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const claimCopy = Object.assign(claim);
      claimCopy.directionQuestionnaire.welshLanguageRequirements.language.speakLanguage = undefined;
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK',
        '',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.speakingLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.ENGLISH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.WELSH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const claimCopy = Object.assign(claim);
      claimCopy.directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage = undefined;
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        '',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.documentsLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS',
        'PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH',
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'No',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if give evidence yourself option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'Yes',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'No',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability question option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
      };
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'Yes',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO',
        vulnerabilityDetails,
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability details is not set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      //When
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO',
        '',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(hearingRequirementsSection.vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      //When
      const hearingRequirementsSection = summarySection({
        title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
        summaryRows: [],
      });
      const mockSummarySection = summaryRow(
        'PAGES.SUPPORT_REQUIRED.TITLE',
        t('COMMON.NO'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );
      //Then
      supportRequiredList.addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
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
      //When
      const hearingRequirementsSection = summarySection({
        title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
        summaryRows: [],
      });
      const mockSummarySection = summaryRow(
        'PAGES.SUPPORT_REQUIRED.TITLE',
        t('COMMON.YES'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );
      //Then
      supportRequiredList.addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });
  });

  describe('buildHearingRequirementsSection', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should not call determinationWithoutHearingReason if option is yes', () => {
      //Given
      const determinationWithoutHearingReasonSpy = jest.spyOn(hearingRequirementsSection, 'determinationWithoutHearingReason');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(determinationWithoutHearingReasonSpy).not.toBeCalled();
    });

    it('should not call determinationWithoutHearingReason if option is undefined', () => {
      //Given
      const determinationWithoutHearingReasonSpy = jest.spyOn(hearingRequirementsSection, 'determinationWithoutHearingReason');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: undefined,
      };
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(determinationWithoutHearingReasonSpy).not.toBeCalled();
    });

    it('should not call giveEvidenceYourself if option is not set', () => {
      //Given
      const giveEvidenceYourselfSpy = jest.spyOn(hearingRequirementsSection, 'giveEvidenceYourself');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(giveEvidenceYourselfSpy).not.toBeCalled();
    });

    it('should not call vulnerabilityQuestion if vulnerability is not set', () => {
      //Given
      const vulnerabilityQuestionSpy = jest.spyOn(hearingRequirementsSection, 'vulnerabilityQuestion');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(vulnerabilityQuestionSpy).not.toBeCalled();
    });

    it('should not call vulnerabilityInfo if vulnerability is not set', () => {
      //Given
      const vulnerabilityInfoSpy = jest.spyOn(hearingRequirementsSection, 'vulnerabilityInfo');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(vulnerabilityInfoSpy).not.toBeCalled();
    });

    it('should not call speakingLanguagePreference if welshLanguageRequirements is not set', () => {
      //Given
      const speakingLanguagePreferenceSpy = jest.spyOn(hearingRequirementsSection, 'speakingLanguagePreference');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(speakingLanguagePreferenceSpy).not.toBeCalled();
    });

    it('should not call documentsLanguagePreference if welshLanguageRequirements is not set', () => {
      //Given
      const documentsLanguagePreferenceSpy = jest.spyOn(hearingRequirementsSection, 'documentsLanguagePreference');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(documentsLanguagePreferenceSpy).not.toBeCalled();
    });

    it('should not call addSupportRequiredList if supportRequiredList is not set', () => {
      //Given
      const addSupportRequiredListSpy = jest.spyOn(supportRequiredList, 'addSupportRequiredList');
      const generateSupportDetailsSpy = jest.spyOn(supportRequiredList, 'generateSupportDetails');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      //When
      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);
      //Then
      expect(addSupportRequiredListSpy).not.toBeCalled();
      expect(generateSupportDetailsSpy).not.toBeCalled();
    });
  });
});
