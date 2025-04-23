import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {VulnerabilityQuestions} from 'models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {GenericYesNo} from 'form/models/genericYesNo';
import {SentExpertReports} from 'models/directionsQuestionnaire/experts/sentExpertReports';
import {ExpertDetailsList} from 'models/directionsQuestionnaire/experts/expertDetailsList';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {ExpertReportDetails} from 'models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {buildHearingRequirementsSectionCommon} from 'services/features/common/buildHearingRequirementsSection';
import {FixedRecoverableCosts} from 'models/directionsQuestionnaire/fixedRecoverableCosts/fixedRecoverableCosts';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';

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
  if (cantAttendHearingInNext12Months === YesNo.YES) {
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

const createFixedRecoverableCostsSection = (subjectToFrc: YesNo, frcAgreed: YesNo, band: string, reasons: string): FixedRecoverableCosts => {

  const fixedRecoverableCosts = new FixedRecoverableCosts();
  fixedRecoverableCosts.subjectToFrc = {
    option: subjectToFrc,
  };
  fixedRecoverableCosts.frcBandAgreed = {
    option: frcAgreed,
  };
  fixedRecoverableCosts.complexityBand = band;
  fixedRecoverableCosts.reasonsForBandSelection = reasons;
  fixedRecoverableCosts.reasonsForNotSubjectToFrc = reasons;
  return fixedRecoverableCosts;
};

const createDisclosureOfDocuments = (hearing: Hearing, disclosureOfDocuments: string[], agreementReached: string, electronicDocs: string, nonElectronicDocs: string): Hearing => {

  hearing.disclosureOfDocuments = new DisclosureOfDocuments();
  hearing.disclosureOfDocuments.documentsTypeChosen = disclosureOfDocuments;
  hearing.hasAnAgreementBeenReached = agreementReached;
  hearing.disclosureOfElectronicDocumentsIssues = electronicDocs;
  hearing.disclosureNonElectronicDocument = nonElectronicDocs;

  return hearing;
};

const createDocumentsToBeConsideredMinti = (hearing: Hearing, documentsToConsidered: YesNo, details: string): Hearing => {

  hearing.hasDocumentsToBeConsidered = {
    option: documentsToConsidered,
  };
  hearing.documentsConsideredDetails = details;

  return hearing;
};

function addTotalAmountAndYesHearing(claim: Claim) {
  claim.totalClaimAmount = 11000;
  claim.directionQuestionnaire.hearing = createHearing(YesNo.YES, YesNo.YES, YesNo.YES, YesNo.YES, undefined, YesNo.YES, YesNo.YES);
}

function addTotalAmountAndYesAllOptionsIntermediate(claim: Claim) {
  claim.totalClaimAmount = 26000;
  claim.directionQuestionnaire.hearing = createHearing(YesNo.YES, YesNo.YES, YesNo.YES, YesNo.YES, undefined, YesNo.YES, YesNo.YES);
  claim.directionQuestionnaire.fixedRecoverableCosts = createFixedRecoverableCostsSection(YesNo.YES, YesNo.YES, ComplexityBandOptions.BAND_2, 'reasons');
  claim.directionQuestionnaire.hearing = createDisclosureOfDocuments(claim.directionQuestionnaire.hearing,
    [TypeOfDisclosureDocument.ELECTRONIC, TypeOfDisclosureDocument.NON_ELECTRONIC], HasAnAgreementBeenReachedOptions.NO, 'electronic', 'non-electronic');
  claim.directionQuestionnaire.hearing = createDocumentsToBeConsideredMinti(claim.directionQuestionnaire.hearing, YesNo.YES, 'considered');
}

function addTotalAmountAndYesAllOptionsMulti(claim: Claim) {
  claim.totalClaimAmount = 150000;
  claim.directionQuestionnaire.hearing = createHearing(YesNo.YES, YesNo.YES, YesNo.YES, YesNo.YES, undefined, YesNo.YES, YesNo.YES);
  claim.directionQuestionnaire.fixedRecoverableCosts = createFixedRecoverableCostsSection(YesNo.YES, YesNo.YES, ComplexityBandOptions.BAND_2, 'reasons');
  claim.directionQuestionnaire.hearing = createDisclosureOfDocuments(claim.directionQuestionnaire.hearing,
    [TypeOfDisclosureDocument.ELECTRONIC, TypeOfDisclosureDocument.NON_ELECTRONIC], HasAnAgreementBeenReachedOptions.NO, 'electronic', 'non-electronic');
  claim.directionQuestionnaire.hearing = createDocumentsToBeConsideredMinti(claim.directionQuestionnaire.hearing, YesNo.YES, 'considered');
}

describe('Hearing Requirements Section', () => {
  let claim: Claim;
  beforeEach(() => {
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
      speakLanguage: LanguageOptions.ENGLISH,
      documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
    };
  });
  describe('FastTrack Claim ', () => {
    it('should build hearing requirement for Fast Track Claim When all questions answer set to yes.', () => {
      //Given
      addTotalAmountAndYesHearing(claim);

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows.length).toEqual(18);
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('Test Doc');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.VARIATION_2.YES');
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
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('COMMON.VARIATION_3.YES');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[16].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[16].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[17].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[17].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should build hearing requirement for Fast Track Claim When all questions answer set to no.', () => {
      //Given
      claim.totalClaimAmount = 11000;
      const hearing = createHearing(YesNo.NO, YesNo.NO, YesNo.NO, YesNo.NO, undefined, YesNo.NO, YesNo.NO);
      claim.directionQuestionnaire.hearing = hearing;

      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);

      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(13);
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.VARIATION_3.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should not display triedToSettleRow when tried to settle is not set', () => {
      //Given
      claim.directionQuestionnaire.hearing = createHearing(undefined, YesNo.NO, YesNo.NO, YesNo.NO, undefined);
      claim.totalClaimAmount = 11000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(13);
      expect(summaryRows.summaryList.rows[0].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
    });
    it('should not display request extra 4 weeks section when no answer for that is set', () => {
      //Given
      claim.directionQuestionnaire.hearing = createHearing(YesNo.NO, undefined, YesNo.NO, YesNo.NO, undefined);
      claim.totalClaimAmount = 11000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(13);
      expect(summaryRows.summaryList.rows[1].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
    });
    it('should not display consider claimant documents section when the answer is not provided', () => {
      //Given
      claim.directionQuestionnaire.hearing = createHearing(YesNo.NO, YesNo.NO, undefined, YesNo.NO, undefined);
      claim.totalClaimAmount = 11000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(13);
      expect(summaryRows.summaryList.rows[2].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    });
    it('should  display expert evidence section when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(19);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE');
    });
    it('should not display expert evidence section when there is no data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = undefined;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(18);
      expect(summaryRows.summaryList.rows[4].key.text).not.toEqual('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE');
    });
    it('should display expert reports when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = new SentExpertReports(YesNoNotReceived.NO);
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(19);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.SENT_EXPERT_REPORTS.TITLE');
    });
    it('should display shared expert section when there is data for that section', () => {
      //Given
      addTotalAmountAndYesHearing(claim);
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sharedExpert = new GenericYesNo(YesNo.YES);
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(19);
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.SHARED_EXPERT.WITH_CLAIMANT');
    });
    it('should display experts when claim has experts', () => {
      //Given
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('John', 'Smith', 'email', 60098, 'reason', 'expert', 1000)]);
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(19);
    });
    it('should not display experts when claim does not have experts', () => {
      //Given
      claim.totalClaimAmount = 11000;
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(11);
      expect(summaryRows.summaryList.rows[5].key.text).not.toContain('PAGES.EXPERT_DETAILS.SECTION_TITLE');
    });
  });

  describe('Intermediate track Claim ', () => {
    it('should build hearing requirement with frc, disclosure and consider documents for Intermediate Track Claim When all questions answer set to yes.', () => {
      //Given
      addTotalAmountAndYesAllOptionsIntermediate(claim);

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows.length).toEqual(26);
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.SUBECT_TO_FRC');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.VARIATION.YES');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.FRC_BAND_AGREED');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.VARIATION.YES');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.FRC_BAND_CHOSEN');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.FRC_BANDS.BAND_2');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_FRC_BAND');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('reasons');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.QUESTION');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.BOTH');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.QUESTION');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_DOCS_ISSUES');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('electronic');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.NON_ELEC_DOCS_DISCLOSURE');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('non-electronic');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('COMMON.VARIATION.YES');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER_DETAILS');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('considered');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES');
      expect(summaryRows.summaryList.rows[15].value.html).toContain('10 October 2023');
      expect(summaryRows.summaryList.rows[15].value.html).toContain('11 December 2023');
      expect(summaryRows.summaryList.rows[16].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS');
      expect(summaryRows.summaryList.rows[16].value.html).toEqual('test reason');
      expect(summaryRows.summaryList.rows[17].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[17].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[18].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[18].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[19].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[19].value.html).toEqual('COMMON.VARIATION_3.YES');
      expect(summaryRows.summaryList.rows[20].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[20].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[21].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[21].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[22].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[22].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[23].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[24].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[24].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[25].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[25].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should build hearing requirement frc, disclosure and consider documents for Intermediate Claim When all questions answer set to no.', () => {
      //Given
      claim.totalClaimAmount = 26000;
      let hearing = createHearing(YesNo.NO, YesNo.NO, YesNo.NO, YesNo.NO, undefined, YesNo.NO, YesNo.NO);
      const frc = createFixedRecoverableCostsSection(YesNo.NO, undefined, undefined, 'reasons');
      hearing = createDisclosureOfDocuments(hearing, undefined, undefined, undefined, undefined);
      hearing = createDocumentsToBeConsideredMinti(hearing, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;
      claim.directionQuestionnaire.fixedRecoverableCosts = frc;

      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);

      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(16);
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.SUBECT_TO_FRC');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.VARIATION.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_NO_FRC_BAND');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('reasons');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.QUESTION');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.VARIATION.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('COMMON.VARIATION_3.NO');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[15].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should not display old consider claimant documents section for int track', () => {
      //Given
      let hearing = createHearing(YesNo.NO, undefined, YesNo.NO, YesNo.NO, undefined);
      const frc = createFixedRecoverableCostsSection(YesNo.NO, undefined, undefined, 'reasons');
      hearing = createDisclosureOfDocuments(hearing, [], undefined, undefined, undefined);
      hearing = createDocumentsToBeConsideredMinti(hearing, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;
      claim.directionQuestionnaire.fixedRecoverableCosts = frc;
      claim.totalClaimAmount = 26000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(16);
      expect(summaryRows.summaryList.rows[2].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    });
  });

  describe('Multi track Claim ', () => {
    it('should build hearing requirement with disclosure and consider documents for Multi Track Claim When all questions answer set to yes.', () => {
      //Given
      addTotalAmountAndYesAllOptionsMulti(claim);

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows.length).toEqual(22);
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.QUESTION');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.BOTH');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.QUESTION');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.ELEC_DOCS_ISSUES');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('electronic');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.NON_ELEC_DOCS_DISCLOSURE');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('non-electronic');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.VARIATION.YES');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER_DETAILS');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('considered');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('COMMON.YES');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES');
      expect(summaryRows.summaryList.rows[11].value.html).toContain('10 October 2023');
      expect(summaryRows.summaryList.rows[11].value.html).toContain('11 December 2023');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('test reason');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[15].value.html).toEqual('COMMON.VARIATION_3.YES');
      expect(summaryRows.summaryList.rows[16].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[16].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[17].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[17].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[18].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[18].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[19].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[20].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[20].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[21].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[21].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should build hearing requirement disclosure and consider documents for Multi Claim When all questions answer set to no.', () => {
      //Given
      claim.totalClaimAmount = 150000;
      let hearing = createHearing(YesNo.NO, YesNo.NO, YesNo.NO, YesNo.NO, undefined, YesNo.NO, YesNo.NO);
      hearing = createDisclosureOfDocuments(hearing, undefined, undefined, undefined, undefined);
      hearing = createDocumentsToBeConsideredMinti(hearing, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;

      claim.directionQuestionnaire.defendantYourselfEvidence = {
        option: YesNo.NO,
      };
      claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {
        option: YesNo.NO,
      };

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);

      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.QUESTION');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.VARIATION.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.VARIATION_3.NO');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
    it('should not display old consider claimant documents section for multi track', () => {
      //Given
      let hearing = createHearing(YesNo.NO, undefined, YesNo.NO, YesNo.NO, undefined);
      hearing = createDisclosureOfDocuments(hearing, [], undefined, undefined, undefined);
      hearing = createDocumentsToBeConsideredMinti(hearing, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;
      claim.totalClaimAmount = 150000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.summaryList.rows[2].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    });
    it('should not display frc section for multi track', () => {
      //Given
      let hearing = createHearing(YesNo.NO, undefined, YesNo.NO, YesNo.NO, undefined);
      hearing = createDisclosureOfDocuments(hearing, [], undefined, undefined, undefined);
      hearing = createDocumentsToBeConsideredMinti(hearing, YesNo.NO, undefined);
      claim.directionQuestionnaire.hearing = hearing;
      claim.totalClaimAmount = 150000;
      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, true);
      //Then
      expect(summaryRows.summaryList.rows.length).toEqual(14);
      expect(summaryRows.summaryList.rows[2].key.text).not.toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    });
  });

  describe('Small Claim', () => {

    it('should build hearing requirement for Small Claim.', () => {
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
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
      };

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('my reason');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.VARIATION_4.NO');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('COMMON.VARIATION_3.YES');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[15].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[16].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[16].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });

    it('should build hearing requirement for Small Claim with determinationWithoutHearing set to Yes.', () => {
      //Given
      claim.totalClaimAmount = 1000;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = createHearing(undefined, undefined, undefined, YesNo.YES, YesNo.YES, YesNo.NO, YesNo.NO);
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
        speakLanguage: LanguageOptions.ENGLISH,
        documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH,
      };

      //When
      const summaryRows = buildHearingRequirementsSectionCommon(claim, '1', 'eng',claim.directionQuestionnaire, false);

      //Then
      expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
      expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE');
      expect(summaryRows.summaryList.rows[0].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.VARIATION_2.NO');
      expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
      expect(summaryRows.summaryList.rows[3].value.html).toEqual('COMMON.VARIATION_4.NO');
      expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE');
      expect(summaryRows.summaryList.rows[4].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
      expect(summaryRows.summaryList.rows[5].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE');
      expect(summaryRows.summaryList.rows[6].value.html).toEqual('COMMON.NO');
      expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[7].value.html).toEqual('COMMON.VARIATION_2.YES');
      expect(summaryRows.summaryList.rows[8].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING');
      expect(summaryRows.summaryList.rows[8].value.html).toEqual('Test Phone or video hearing');
      expect(summaryRows.summaryList.rows[9].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION');
      expect(summaryRows.summaryList.rows[9].value.html).toEqual('COMMON.VARIATION_3.YES');
      expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO');
      expect(summaryRows.summaryList.rows[10].value.html).toEqual('Test vulnerability details');
      expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.SPECIFIC_COURT.SELECTED_COURT');
      expect(summaryRows.summaryList.rows[11].value.html).toEqual('High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR');
      expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.SPECIFIC_COURT.REASON');
      expect(summaryRows.summaryList.rows[12].value.html).toEqual('test');
      expect(summaryRows.summaryList.rows[13].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE');
      expect(summaryRows.summaryList.rows[13].value.html).toEqual(null);
      expect(summaryRows.summaryList.rows[14].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK');
      expect(summaryRows.summaryList.rows[14].value.html).toEqual('PAGES.WELSH_LANGUAGE.ENGLISH');
      expect(summaryRows.summaryList.rows[15].key.text).toEqual('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS');
      expect(summaryRows.summaryList.rows[15].value.html).toEqual('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH');
    });
  });
});
