import {Claim} from '../../../../../../../main/common/models/claim';
import {
  DirectionQuestionnaire,
} from '../../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from '../../../../../../../main/common/models/directionsQuestionnaire/hearing/hearing';
import {
  determinationWithoutHearingQuestion,
  determinationWithoutHearingReason,
  documentsLanguagePreference,
  giveEvidenceYourself,
  speakingLanguagePreference,
  vulnerabilityQuestion,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
import {summaryRow} from '../../../../../../../main/common/models/summaryList/summaryList';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {
  WelshLanguageRequirements,
} from '../../../../../../../main/common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from '../../../../../../../main/common/models/directionsQuestionnaire/languageOptions';
import {
  VulnerabilityQuestions,
} from '../../../../../../../main/common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';

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

      expect(determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(speakingLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(documentsLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(giveEvidenceYourself(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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

      expect(vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });
});
