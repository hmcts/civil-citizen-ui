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
  giveEvidenceYourself, phoneAndVideoInfo, phoneAndVideoQuestion,
  speakingLanguagePreference,
  vulnerabilityInfo,
  vulnerabilityQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildCommonHearingRequirements';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
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

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
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

      expect(vulnerabilityInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
      addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
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
      addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
      expect(hearingRequirementsSection.summaryList.rows[0]).toStrictEqual(mockSummarySection);
    });
  });

  describe('test getWithnesses', () => {
    it('should display \'no\' when there is no witnesses', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [];
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.NO;

      const summaryRows = getWitnesses(claim, '1', 'eng');

      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual(YesNoUpperCamelCase.NO);
    });

    it('should display \'yes\' and 1 witness details', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1];

      const summaryRows = getWitnesses(claim, '1', 'eng');

      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual(YesNoUpperCamelCase.YES);

      expect(summaryRows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');

      expect(summaryRows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[2].value.html).toEqual('Joe');

      expect(summaryRows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[3].value.html).toEqual('Doe');

      expect(summaryRows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[4].value.html).toEqual('joe@doe.com');

      expect(summaryRows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[5].value.html).toEqual('000000000');

      expect(summaryRows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[6].value.html).toEqual('Here is some of details');

    });

    it('should display \'yes\' and have 2 witnesses', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
      claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1, witness2];

      const summaryRows = getWitnesses(claim, '1', 'eng');

      expect(summaryRows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows[0].value.html).toEqual(YesNoUpperCamelCase.YES);
      // Witness 1
      expect(summaryRows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');
      expect(summaryRows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[2].value.html).toEqual('Joe');
      expect(summaryRows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[3].value.html).toEqual('Doe');
      expect(summaryRows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[4].value.html).toEqual('joe@doe.com');
      expect(summaryRows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[5].value.html).toEqual('000000000');
      expect(summaryRows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[6].value.html).toEqual('Here is some of details');
      // Witness 2
      expect(summaryRows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 2');
      expect(summaryRows[8].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
      expect(summaryRows[8].value.html).toEqual('Jane');
      expect(summaryRows[9].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
      expect(summaryRows[9].value.html).toEqual('Does');
      expect(summaryRows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
      expect(summaryRows[10].value.html).toEqual('jane@does.com');
      expect(summaryRows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
      expect(summaryRows[11].value.html).toEqual('111111111');
      expect(summaryRows[12].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
      expect(summaryRows[12].value.html).toEqual('Some details of Jane Does');
    });
  });

  describe('phone or Video hearing question', () => {
    it('should return summaryRow if phone or video hearing question option is no', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.NO,
      };

      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING',
        'No',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );

      expect(phoneAndVideoQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if phone or video hearing question option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
      };

      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING',
        'Yes',
        `/case/${claimId}/directions-questionnaire/phone-or-video-hearing`,
        changeButton,
      );

      expect(phoneAndVideoQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('phone or Video hearing details', () => {
    it('should return summaryRow if phone or video hearing question option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'Test reason.',
      };

      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING',
        'Test reason.',
      );

      expect(phoneAndVideoInfo(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });
});
