import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {ReportDetail} from 'models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';

const mockReportDetail: ReportDetail = new ReportDetail('Joe', '2023', '5', '10' );

describe('translate DQ extra details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  claim.directionQuestionnaire.experts = new Experts();

  it('should return undefined if data doesnt exist', () => {
    //given
    const expected: CCDDQExtraDetails = {
      wantPhoneOrVideoHearing: undefined,
      whyPhoneOrVideoHearing: '',
      whyUnavailableForHearing: undefined,
      giveEvidenceYourSelf: undefined,
      triedToSettle: undefined,
      determinationWithoutHearingRequired: undefined,
      determinationWithoutHearingReason: '',
      requestExtra4weeks: undefined,
      considerClaimantDocuments: undefined,
      considerClaimantDocumentsDetails: '',
      respondent1DQLiPExpert: {
        expertCanStillExamine: undefined,
        expertCanStillExamineDetails: '',
        expertReportRequired: undefined,
        reportDetails: undefined,
      },
    };

    //When
    const dqExtraDetails = toCCDDQExtraDetails(claim.directionQuestionnaire);
    //then
    expect(dqExtraDetails).toEqual(expected);
  });

  it('should return values if data exist',() => {
    //given
    claim.directionQuestionnaire.hearing = {
      phoneOrVideoHearing: {
        option: YesNo.YES,
        details: 'Need Phone hearing',
      },
      whyUnavailableForHearing: {
        reason: 'out of city',
      },
      determinationWithoutHearing: {
        option: YesNo.NO,
        reasonForHearing: 'reasonForHearing',
      },
      requestExtra4weeks: new GenericYesNo(YesNo.YES),
      triedToSettle: new GenericYesNo(YesNo.YES),
      considerClaimantDocuments: {
        option: YesNo.YES,
        details: 'details',
      },
    };

    claim.directionQuestionnaire.experts = {
      expertReportDetails: {
        option: YesNo.YES,
        reportDetails:[mockReportDetail],
      },
      expertEvidence: new GenericYesNo('Yes'),
      expertCanStillExamine: {
        option: YesNo.YES,
        details: 'details',
      },
    };

    claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};

    const expected: CCDDQExtraDetails = {
      wantPhoneOrVideoHearing: YesNoUpperCamelCase.YES,
      whyPhoneOrVideoHearing: 'Need Phone hearing',
      whyUnavailableForHearing: 'out of city',
      giveEvidenceYourSelf: YesNoUpperCamelCase.YES,
      triedToSettle: YesNoUpperCamelCase.YES,
      determinationWithoutHearingRequired: YesNoUpperCamelCase.NO,
      determinationWithoutHearingReason: 'reasonForHearing',
      requestExtra4weeks: YesNoUpperCamelCase.YES,
      considerClaimantDocuments: YesNoUpperCamelCase.YES,
      considerClaimantDocumentsDetails: 'details',
      respondent1DQLiPExpert: {
        expertCanStillExamine: YesNoUpperCamelCase.YES,
        expertCanStillExamineDetails: 'details',
        expertReportRequired: YesNoUpperCamelCase.YES,
        reportDetails: [{
          value: {
            'expertName': mockReportDetail.expertName,
            'reportDate': mockReportDetail.reportDate,
          },
        }],
      },
    };

    //When
    const dqExtraDetails = toCCDDQExtraDetails(claim.directionQuestionnaire);
    //then
    expect(dqExtraDetails).toEqual(expected);
  });
});
