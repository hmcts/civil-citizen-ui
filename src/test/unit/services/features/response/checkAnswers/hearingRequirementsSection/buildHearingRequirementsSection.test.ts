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
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'No',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );

      expect(hearingRequirementsSection.determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'Yes',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );

      expect(hearingRequirementsSection.determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('determinationWithoutHearingReason', () => {
    it('should return summaryRow if determination without hearing reason is set', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        reasonForHearing: 'my reason',
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        'my reason',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );

      expect(hearingRequirementsSection.determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing reason is not set', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {};
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        '',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );

      expect(hearingRequirementsSection.determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('speakingLanguagePreference', () => {
    it('should return summaryRow if language preference is english', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is welsh', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is english and welsh', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if language preference is not provided', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.speakingLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('documentsLanguagePreference', () => {
    it('should return summaryRow if document language preference is english', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is welsh', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is not provided', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.documentsLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if document language preference is english and welsh', () => {
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
        `/case/${claimId}/directions-questionnaire/welsh-language`,
        changeButton,
      );

      expect(hearingRequirementsSection.documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('giveEvidenceYourself', () => {
    it('should return summaryRow if give evidence yourself option is no', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'No',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );

      expect(hearingRequirementsSection.giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if give evidence yourself option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'Yes',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );

      expect(hearingRequirementsSection.giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('vulnerabilityQuestion', () => {
    it('should return summaryRow if vulnerability question option is no', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'No',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );

      expect(hearingRequirementsSection.vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability question option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION',
        'Yes',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );

      expect(hearingRequirementsSection.vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('vulnerabilityInfo', () => {
    it('should return summaryRow if vulnerability details is set', () => {
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

      expect(hearingRequirementsSection.vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if vulnerability details is not set', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();

      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO',
        '',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );

      expect(hearingRequirementsSection.vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('addSupportRequiredList', () => {
    it('should return summaryRow if supportRequiredList option is no', () => {
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
        t('COMMON.NO'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );

      supportRequiredList.addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if supportRequiredList option is yes', () => {
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
        t('COMMON.YES'),
        `/case/${claimId}/directions-questionnaire/support-required`,
        changeButton,
      );

      supportRequiredList.addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });
  });

  describe('buildHearingRequirementsSection', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should not call determinationWithoutHearingReason if option is yes', () => {
      const determinationWithoutHearingReasonSpy = jest.spyOn(hearingRequirementsSection, 'determinationWithoutHearingReason');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(determinationWithoutHearingReasonSpy).not.toBeCalled();
    });

    it('should not call determinationWithoutHearingReason if option is undefined', () => {
      const determinationWithoutHearingReasonSpy = jest.spyOn(hearingRequirementsSection, 'determinationWithoutHearingReason');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: undefined,
      };

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(determinationWithoutHearingReasonSpy).not.toBeCalled();
    });

    it('should not call giveEvidenceYourself if option is not set', () => {
      const giveEvidenceYourselfSpy = jest.spyOn(hearingRequirementsSection, 'giveEvidenceYourself');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(giveEvidenceYourselfSpy).not.toBeCalled();
    });

    it('should not call vulnerabilityQuestion if vulnerability is not set', () => {
      const vulnerabilityQuestionSpy = jest.spyOn(hearingRequirementsSection, 'vulnerabilityQuestion');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(vulnerabilityQuestionSpy).not.toBeCalled();
    });

    it('should not call vulnerabilityInfo if vulnerability is not set', () => {
      const vulnerabilityInfoSpy = jest.spyOn(hearingRequirementsSection, 'vulnerabilityInfo');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(vulnerabilityInfoSpy).not.toBeCalled();
    });

    it('should not call speakingLanguagePreference if welshLanguageRequirements is not set', () => {
      const speakingLanguagePreferenceSpy = jest.spyOn(hearingRequirementsSection, 'speakingLanguagePreference');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(speakingLanguagePreferenceSpy).not.toBeCalled();
    });

    it('should not call documentsLanguagePreference if welshLanguageRequirements is not set', () => {
      const documentsLanguagePreferenceSpy = jest.spyOn(hearingRequirementsSection, 'documentsLanguagePreference');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(documentsLanguagePreferenceSpy).not.toBeCalled();
    });

    it('should not call addSupportRequiredList if supportRequiredList is not set', () => {
      const addSupportRequiredListSpy = jest.spyOn(supportRequiredList, 'addSupportRequiredList');
      const generateSupportDetailsSpy = jest.spyOn(supportRequiredList, 'generateSupportDetails');
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();

      hearingRequirementsSection.buildHearingRequirementsSection(claim, claimId, lng);

      expect(addSupportRequiredListSpy).not.toBeCalled();
      expect(generateSupportDetailsSpy).not.toBeCalled();
    });
  });
});
