import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {
  considerClaimantDocQuestion,
  considerClaimantDocResponse,
  getExpert,
  getSentReportToOtherParties,
  getShareExpertWithClaimant,
  getUseExpertEvidence,
  displayDefendantUnavailableDate, displaySpecificCourtLocation,
  getDefendantUnavailableDate,
  getSpecificCourtLocation, getUnavailableHearingDays,
  requestExtra4WeeksQuestion,
  triedToSettleQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';
import {
  ExpertDetailsList
} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetailsList';
import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {
  giveEvidenceYourself
} from "services/features/response/checkAnswers/hearingRequirementsSection/buildCommonHearingRequirements";

import {ExpertDetails} from "models/directionsQuestionnaire/experts/expertDetails";
import {
  UnavailableDatePeriod,
  UnavailableDateType
} from "../../../../../../../main/common/models/directionsQuestionnaire/hearing/unavailableDates";
import {
  SpecificCourtLocation
} from "../../../../../../../main/common/models/directionsQuestionnaire/hearing/specificCourtLocation";

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Fast Track Claim Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('triedToSettleQuestion', () => {
    it('should return summaryRow if triedToSettle option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/tried-to-settle`,
        changeButton,
      );
      //Then
      expect(triedToSettleQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('requestExtra4WeeksQuestion', () => {
    it('should return summaryRow if requestExtra4Weeks option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.requestExtra4weeks = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS',
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/request-extra-4-weeks`,
        changeButton,
      );
      //Then
      expect(requestExtra4WeeksQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('considerClaimantDocQuestion', () => {
    it('should return summaryRow if considerClaimantDocuments option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT',
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/consider-claimant-documents`,
        changeButton,
      );
      //Then
      expect(considerClaimantDocQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow for document details if considerClaimantDocuments option is Yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
        option: YesNo.NO,
        details: 'Test doc',
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
        'Test doc',
      );
      //Then
      expect(considerClaimantDocResponse(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('should return summary row relative to expect', ()=>{
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    it('should not display expert if the the expect evidence is NO',  () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      //When
      claim.directionQuestionnaire.experts.expertEvidence =  {option:YesNo.NO};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList(
        [new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111,
          'reason', 'expert', 500)]);

      const result: any[] = []
      //Then
      expect(getExpert(claim, claimId, lng)).toStrictEqual(result);
    });
    it('should display expert details if the expect evidence is YES', function () {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {option:YesNo.YES};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();

      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111, 'reason', 'expert', 500)]);
      //When
      const summaryRows = getExpert(claim, '1', 'eng');
      //Then
      expect(summaryRows.length).toEqual(8);
      expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_DETAILS.SECTION_TITLE 1');
      expect(summaryRows[1].key.text).toEqual('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL');
      expect(summaryRows[1].value.html).toEqual('Mike');
      expect(summaryRows[2].key.text).toEqual('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL');
      expect(summaryRows[2].value.html).toEqual('James');
      expect(summaryRows[3].key.text).toEqual('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL');
      expect(summaryRows[3].value.html).toEqual('mike@gmail.com');
      expect(summaryRows[4].key.text).toEqual('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL');
      expect(summaryRows[4].value.html).toEqual('7411111');
      expect(summaryRows[5].key.text).toEqual('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE');
      expect(summaryRows[5].value.html).toEqual('expert');
      expect(summaryRows[6].key.text).toEqual('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT');
      expect(summaryRows[6].value.html).toEqual('reason');
      expect(summaryRows[7].key.text).toEqual('PAGES.EXPERT_DETAILS.COST_OPTIONAL');
      expect(summaryRows[7].value.html).toEqual('500');

    });
    it('should display the use of expert evidence No if the claimant choose not',  () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/expert-evidence`,
        changeButton,
      );
      //When
      const doWantUseExpectEvidence = getUseExpertEvidence(claim, claimId, lng);
      //Then
      expect(doWantUseExpectEvidence).toStrictEqual(mockSummarySection)
    });
    it('should display the use of own evidence No if the claimant choose not',  () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.NO};
      //Given
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //When
      const personalEvidence = giveEvidenceYourself(claim, claimId, lng);
      //Then
      expect(personalEvidence).toStrictEqual(mockSummarySection)
    });
    it('should display No if the defendant does not accept to share expert  with the claimant', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sharedExpert = {option: YesNo.NO};
      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SHARED_EXPERT.WITH_CLAIMANT',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/shared-expert`,
        changeButton,
      );
      //When
      const shareExpertWithClaimant = getShareExpertWithClaimant(claim, claimId, lng);
      //Then
      expect(shareExpertWithClaimant).toStrictEqual(mockSummarySection)
    });
    it('should display No if the defendant has not send expert report to other parties', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NO };

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/sent-expert-reports`,
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection)
    });
    it('should display No if the claimant has not yet received expert report to other parties', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NOT_RECEIVED };

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED',
        `/case/validClaimId/directions-questionnaire/sent-expert-reports`,
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection)
    });
  });

  describe('should return summary row relative to expect', ()=>{
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    it('should not display expert if the the expect evidence is NO',  () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      //When
      claim.directionQuestionnaire.experts.expertEvidence =  {option:YesNo.NO};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111, 'reason', 'expert', 500)]);
      const result: any[] = []
      //Then
      expect(getExpert(claim, claimId, lng)).toStrictEqual(result);
    });
    it('should display expert details if the expect evidence is YES', function () {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {option:YesNo.YES};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();

      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111, 'reason', 'expert', 500)]);
      //When
      const summaryRows = getExpert(claim, '1', 'eng');
      //Then
      expect(summaryRows.length).toEqual(8);
      expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_DETAILS.SECTION_TITLE 1');
      expect(summaryRows[1].key.text).toEqual('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL');
      expect(summaryRows[1].value.html).toEqual('Mike');
      expect(summaryRows[2].key.text).toEqual('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL');
      expect(summaryRows[2].value.html).toEqual('James');
      expect(summaryRows[3].key.text).toEqual('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL');
      expect(summaryRows[3].value.html).toEqual('mike@gmail.com');
      expect(summaryRows[4].key.text).toEqual('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL');
      expect(summaryRows[4].value.html).toEqual('7411111');
      expect(summaryRows[5].key.text).toEqual('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE');
      expect(summaryRows[5].value.html).toEqual('expert');
      expect(summaryRows[6].key.text).toEqual('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT');
      expect(summaryRows[6].value.html).toEqual('reason');
      expect(summaryRows[7].key.text).toEqual('PAGES.EXPERT_DETAILS.COST_OPTIONAL');
      expect(summaryRows[7].value.html).toEqual('500');

    });
    it('should display the use of expert evidence No if the claimant choose not',  () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/expert-evidence`,
        changeButton,
      );
      //When
      const doWantUseExpectEvidence = getUseExpertEvidence(claim, claimId, lng);
      //Then
      expect(doWantUseExpectEvidence).toStrictEqual(mockSummarySection)
    });
    it('should display the use of own evidence No if the claimant choose not',  () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.NO};
      //Given
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/give-evidence-yourself`,
        changeButton,
      );
      //When
      const personalEvidence = giveEvidenceYourself(claim, claimId, lng);
      //Then
      expect(personalEvidence).toStrictEqual(mockSummarySection)
    });
    it('should display No if the defendant does not accept to share expert  with the claimant', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sharedExpert = {option: YesNo.NO};
      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SHARED_EXPERT.TITLE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/shared-expert`,
        changeButton,
      );
      //When
      const shareExpertWithClaimant = getShareExpertWithClaimant(claim, claimId, lng);
      //Then
      expect(shareExpertWithClaimant).toStrictEqual(mockSummarySection)
    });
    it('should display No if the defendant has not send expert report to other parties', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NO };

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'COMMON.NO',
        `/case/validClaimId/directions-questionnaire/sent-expert-reports`,
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection)
    });
    it('should display No if the claimant has not yet received expert report to other parties', function () {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NOT_RECEIVED };

      //Given
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED',
        `/case/validClaimId/directions-questionnaire/sent-expert-reports`,
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection)
    });
  })

  describe('should return summary rows relative to unavailable date for hearing', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();

    it('should display NO if defendant select NO on question expert or witnesses cannot go to hearing ',  () => {

      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option:YesNo.NO};
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton
      );

      //GIVEN
      const defendantUnavailableDate = displayDefendantUnavailableDate(claim, claimId, lng)

      // THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);

    });

    it('should display YES if defendant select YES on question expert or witnesses cannot go to hearing ', () => {

      //WHEN
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option:YesNo.YES};
      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
        'COMMON.YES',
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton
      );

      //GIVEN
      const defendantUnavailableDate = displayDefendantUnavailableDate(claim, claimId, lng)

      //THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);

    });

    it('should  display unavailable single date if defendant YES ', () => {

      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option:YesNo.YES};

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
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton
      );

      //GIVEN
      const defendantUnavailableDate = getDefendantUnavailableDate(claim, claimId, lng)

      //THEN
      expect(defendantUnavailableDate).toStrictEqual(mockSummarySection);

    });

    it('should  display unavailable range of date if defendant YES ', () => {

      //WHEN
      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option:YesNo.YES};

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
        items: [longerPeriod4DaysOverlapMockData]
      };

      const mockSummarySection = summaryRow(
        'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES',
        ' 10 December 2023<br>11 December 2023<br>12 December 2023<br>13 December 2023<br>14 December 2023',
        '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
        changeButton
      );

      //GIVEN
      const defendantUnavailableDates = getDefendantUnavailableDate(claim, claimId, lng)

      //THEN
      expect(defendantUnavailableDates).toStrictEqual(mockSummarySection);
    });

    describe('Should display if the number of dates unavailable was greater than 30 ', ()=>{

      claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option:YesNo.YES};
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

      it('should display Why are you unavailable with the number of days ',  () => {

        //WHEN
        claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
          items: [longerPeriod4DaysOverlapMockData]
        };
        claim.directionQuestionnaire.hearing.whyUnavailableForHearing = { reason: "I will be out the country"}

        const mockSummarySection = summaryRow(
          'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS',
          'I will be out the country',
          '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
          changeButton
        );
        // GIVEN
        const unavailableHearingDays = getUnavailableHearingDays(claim, claimId, lng);

        //THEN
        expect(unavailableHearingDays).toStrictEqual(mockSummarySection);

      });

      it('should display the reason if the number of dates unavailable was greater than 30 ',  () => {

        //WHEN
        claim.directionQuestionnaire.hearing.unavailableDatesForHearing = {
          items: [longerPeriod4DaysOverlapMockData]
        };
        claim.directionQuestionnaire.hearing.whyUnavailableForHearing = { reason: "I will be out the country"}

        const mockSummarySection = summaryRow(
          'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS',
          'I will be out the country',
          '/case/validClaimId/directions-questionnaire/cant-attend-hearing-in-next-12-months',
          changeButton
        );
        // GIVEN
        const unavailableHearingDays = getUnavailableHearingDays(claim, claimId, lng);

        //THEN
        expect(unavailableHearingDays).toStrictEqual(mockSummarySection);

      });
    })

  });

  describe('should return summary rows relative to court location defendant choice on the day of hearing', ()=>{
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();
    const courtLocations = [{
      code: '28b3277a-92f8-4e6b-a8b5-78c5de5c9a7a',
      label: "Barnet Civil and Family Centre - ST MARY'S COURT, REGENTS PARK ROAD - N3 1BQ"
    }]

    it('should display NO if the defendant does not have a preference for  hearing court location', function () {

      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation(YesNo.NO, courtLocations[0].label, 'reason');
      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton
      );

      //WHEN
      let specificCourtLocation: SummaryRow = getSpecificCourtLocation(claim, claimId, lng);


      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);

    });
    it('should display YES if the defendant does have a preference for  hearing court location', function () {

      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation(YesNo.YES, courtLocations[0].label, 'reason');

      //WHEN
      let specificCourtLocation: SummaryRow = getSpecificCourtLocation(claim, claimId, lng);

      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.TITLE',
        'COMMON.YES',
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton
      );
      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });
    it('should display court location if the defendant does have a preference for  hearing', function () {

      //GIVEN
      claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation(YesNo.YES, courtLocations[0].label, 'reason');

      //WHEN
      let specificCourtLocation: SummaryRow = displaySpecificCourtLocation(claim, claimId, lng);

      const mockSummarySection: SummaryRow = summaryRow(
        'PAGES.SPECIFIC_COURT.SELECTED_COURT',
        courtLocations[0].label,
        '/case/validClaimId/directions-questionnaire/court-location',
        changeButton
      );

      //THEN
      expect(specificCourtLocation).toStrictEqual(mockSummarySection);
    });
  })

});
