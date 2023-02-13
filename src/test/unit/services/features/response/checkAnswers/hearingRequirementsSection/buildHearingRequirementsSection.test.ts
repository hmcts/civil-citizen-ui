import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  buildHearingRequirementsSection,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
import {VulnerabilityQuestions} from 'models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Hearing Requirements Section', () => {
  describe('FastTrack Claim ', () => {
    it('build hearing requirement for Fast Track Claim.', () => {
      const claim = new Claim();
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing = {
        triedToSettle : {
          option: YesNo.YES,
        },
        requestExtra4weeks : {
          option: YesNo.YES,
        },
        considerClaimantDocuments : {
          option: YesNo.YES,
          details: 'Test Doc',
        },
      };
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
        vulnerabilityDetails: 'Test vulnerability details',
      };

      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'Test Phone or video hearing',
      };

      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage : LanguageOptions.ENGLISH,
        documentsLanguage : LanguageOptions.WELSH_AND_ENGLISH,
      };

      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');

      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('Test Doc');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual(YesNoUpperCamelCase.NO);
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');

    });
  });

  describe('Small Claim', () => {
    it('build hearing requirement for Small Claim.', () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
        reasonForHearing: 'my reason',
      };
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
        vulnerabilityDetails: 'Test vulnerability details',
      };

      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'Test Phone or video hearing',
      };

      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage : LanguageOptions.ENGLISH,
        documentsLanguage : LanguageOptions.WELSH_AND_ENGLISH,
      };

      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[1].key.text).toEqual(' PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('my reason');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual(YesNoUpperCamelCase.NO);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual(YesNoUpperCamelCase.YES);
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
  });

});
