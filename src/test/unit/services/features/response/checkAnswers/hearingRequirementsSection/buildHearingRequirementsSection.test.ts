import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {
  buildHearingRequirementsSection,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
import {VulnerabilityQuestions} from 'models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import { Experts } from 'common/models/directionsQuestionnaire/experts/experts';
import {GenericYesNo} from 'form/models/genericYesNo';
import {SentExpertReports} from 'models/directionsQuestionnaire/experts/sentExpertReports';
import {ExpertDetailsList} from 'models/directionsQuestionnaire/experts/expertDetailsList';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const createHearing = (triedToSettleOption: YesNo, requestExtra4weeksOption: YesNo,
  considerClaimantDocumentsOption: YesNo, phoneOrVideoHearing: YesNo,
  determinationWithoutHearing: YesNo): Hearing => {

  const hearing = new Hearing();
  hearing.triedToSettle = {
    option: triedToSettleOption,
  };
  hearing.requestExtra4weeks = {
    option: requestExtra4weeksOption,
  };
  hearing.considerClaimantDocuments = {
    option: considerClaimantDocumentsOption,
    details: 'Test Doc',
  };
  hearing.phoneOrVideoHearing = {
    option: phoneOrVideoHearing,
    details: 'Test Phone or video hearing',
  };

  hearing.determinationWithoutHearing = {
    option: determinationWithoutHearing,
    reasonForHearing: 'my reason',
  };
  return hearing;
};

function addTotalAmountAndYesHearing(claim: Claim) {
  claim.totalClaimAmount = 11000;
  claim.directionQuestionnaire.hearing = createHearing(YesNo.YES, YesNo.YES, YesNo.YES, YesNo.YES, undefined);
}

describe('Hearing Requirements Section', () => {
  let claim:Claim;
  beforeEach(()=>{
    claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();

    claim.directionQuestionnaire.defendantYourselfEvidence = {
      option: YesNo.YES,
    };
    claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
    claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
      option: YesNo.YES,
      vulnerabilityDetails: 'Test vulnerability details',
    };

    claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
    claim.directionQuestionnaire.welshLanguageRequirements.language = {
      speakLanguage : LanguageOptions.ENGLISH,
      documentsLanguage : LanguageOptions.WELSH_AND_ENGLISH,
    };
  });
  describe('FastTrack Claim ', () => {
    it('should build hearing requirement for Fast Track Claim When all questions answer set to yes.', () => {
      //Given
      addTotalAmountAndYesHearing(claim);

      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('Test Doc');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should build hearing requirement for Fast Track Claim When all questions answer set to no.', () => {
      //Given
      claim.totalClaimAmount = 11000;
      const hearing = createHearing(YesNo.NO, YesNo.NO, YesNo.NO, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;

      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };

      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');

      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(10);
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should not display triedToSettleRow when tried to settle is not set', ()=> {
      //Given
      claim.directionQuestionnaire.hearing =  createHearing(undefined, YesNo.NO, YesNo.NO, YesNo.NO, undefined);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(12);
      expect(summaryRows.summaryList.rows[0].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
    });
    it('should not display request extra 4 weeks section when no answer for that is set', () => {
      //Given
      claim.directionQuestionnaire.hearing =  createHearing(YesNo.NO, undefined, YesNo.NO, YesNo.NO, undefined);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(12);
      expect(summaryRows.summaryList.rows[1].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
    });
    it('should not display consider claimant documents section when the answer is not provided', () =>{
      //Given
      claim.directionQuestionnaire.hearing =  createHearing(YesNo.NO, YesNo.NO, undefined, YesNo.NO, undefined);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(12);
      expect(summaryRows.summaryList.rows[2].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    });
    it('should  display expert evidence section when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE');
    });
    it('should not display expert evidence section when there is no data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = undefined;
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(13);
      expect(summaryRows.summaryList.rows[4].key.text).not.toEqual('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE');
    });
    it('should display expert reports when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = new SentExpertReports(YesNoNotReceived.NO);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.SENT_EXPERT_REPORTS.TITLE');
    });
    it('should display shared expert section when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sharedExpert = new GenericYesNo(YesNo.YES);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.SHARED_EXPERT.WITH_CLAIMANT');
    });
    it('should display experts when claim has experts', () => {
      //Given
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('John', 'Smith')]);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(16);
      expect(summaryRows.summaryList.rows[1].key.text).toContain('PAGES.EXPERT_DETAILS.SECTION_TITLE');
    });
    it('should not display experts when claim does not have experts', () => {
      //Given
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);
      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(8);
      expect(summaryRows.summaryList.rows[1].key.text).not.toContain('PAGES.EXPERT_DETAILS.SECTION_TITLE');
    });
  });

  describe('Small Claim', () => {

    it('should build hearing requirement for Small Claim.', () => {
      //Given
      claim.totalClaimAmount = 1000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = createHearing(undefined, undefined,undefined,YesNo.YES, YesNo.NO);
      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.YES,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
        vulnerabilityDetails: 'Test vulnerability details',
      };

      claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.directionQuestionnaire.welshLanguageRequirements.language = {
        speakLanguage : LanguageOptions.ENGLISH,
        documentsLanguage : LanguageOptions.WELSH_AND_ENGLISH,
      };

      //When
      const summaryRows = buildHearingRequirementsSection(claim, '1', 'eng');

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.VARIATION.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.VARIATION.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('my reason');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
  });
});
