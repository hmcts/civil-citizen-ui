import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo} from 'form/models/yesNo';
import {
  buildHearingRequirementsSection,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
import {VulnerabilityQuestions} from 'models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const createHearing = (triedToSettleOption: YesNo, requestExtra4weeksOption: YesNo,
  considerClaimantDocumentsOption: YesNo, phoneOrVideoHearing: YesNo,
  determinationWithoutHearing: YesNo, cantAttendHearingInNext12Months?: YesNo,
  specificCourtLocation?: YesNo,
): Hearing => {

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
  hearing.cantAttendHearingInNext12Months = {
    option: cantAttendHearingInNext12Months,
  };
  if (cantAttendHearingInNext12Months === YesNo.YES){
    hearing.unavailableDatesForHearing = {
      items: [{
        type: UnavailableDateType.LONGER_PERIOD,
        from: new Date('2023-10-10T00:00:00.000Z'),
        until: new Date('2023-12-12T00:00:00.000Z'),
      }],
    };
    hearing.whyUnavailableForHearing = {
      reason: 'test reason',
    };
  }
  hearing.specificCourtLocation = <SpecificCourtLocation>{
    option: specificCourtLocation,
    courtLocation: 'High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR',
    reason: 'test',
  };
  return hearing;
};

describe('Hearing Requirements Section', () => {
  const claim = new Claim();
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
  describe('FastTrack Claim ', () => {

    it('build hearing requirement for Fast Track Claim When all questions answer set to yes.', () => {
      //Given
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire.hearing = createHearing(YesNo.YES, YesNo.YES, YesNo.YES, YesNo.YES, undefined, YesNo.YES, YesNo.YES);
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.YES,
        vulnerabilityDetails: 'Test vulnerability details',
      };

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
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES');
      expect(summaryRows.summaryList.rows[7].value.html).toContain('10 October 2023');
      expect(summaryRows.summaryList.rows[7].value.html).toContain('11 December 2023');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('test reason');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('Test vulnerability details');

    });

    it('build hearing requirement for Fast Track Claim When all questions answer set to no.', () => {
      //Given
      const hearing = createHearing(YesNo.NO, YesNo.NO, YesNo.NO, YesNo.NO, undefined, YesNo.NO, YesNo.NO, YesNo.NO);
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
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.SPECIFIC_COURT.TITLE');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
  });

  describe('Small Claim', () => {

    it('build hearing requirement for Small Claim.', () => {
      //Given
      claim.totalClaimAmount = 1000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = createHearing(undefined, undefined, undefined, YesNo.YES, YesNo.NO, YesNo.NO, YesNo.NO);
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
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('my reason');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.SPECIFIC_COURT.TITLE');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
  });
});
