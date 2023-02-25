import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {summaryRow} from 'models/summaryList/summaryList';
import {
  documentsLanguagePreference,
  getWitnesses,
  phoneAndVideoInfo, phoneAndVideoQuestion,
  speakingLanguagePreference,
  vulnerabilityInfo,
  vulnerabilityQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildCommonHearingRequirements';
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
  getDisplayWantGiveSelfEvidence,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const witness1 =  new OtherWitnessItems({
  firstName: 'Joe',
  lastName: 'Doe',
  telephone: '000000000',
  email: 'joe@doe.com',
  details: 'Here is some of details',
});

const witness2 =  new OtherWitnessItems({
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
      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(speakingLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(speakingLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(documentsLanguagePreference(claimCopy, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(documentsLanguagePreference(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(getDisplayWantGiveSelfEvidence(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //Then
      expect(getDisplayWantGiveSelfEvidence(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/vulnerability`,
        changeButton,
      );
      //Then
      expect(vulnerabilityQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        t('COMMON.NO'),
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
        t('COMMON.YES'),
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
      const summaryRows = getWitnesses(claim, '1', 'eng');
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
      const summaryRows = getWitnesses(claim, '1', 'eng');
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
      const summaryRows = getWitnesses(claim, '1', 'eng');

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
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );
      //Then
      expect(phoneAndVideoQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );
      //Then
      expect(phoneAndVideoQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      expect(phoneAndVideoInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });
});
