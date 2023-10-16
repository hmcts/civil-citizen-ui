import {Claim} from 'common/models/claim';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {translateClaimantResponseToCCD} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {Mediation} from 'common/models/mediation/mediation';
import {mockExpertDetailsList} from '../../features/directionsQuestionnaire/experts/expertDetailsService.test';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {CaseState} from 'common/form/models/claimDetails';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';

describe('Translate claimant response to ccd version', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
  });
  it('should translate hasPartAdmittedBeenAccepted to ccd', () => {
    //Given
    claim.claimantResponse.hasPartAdmittedBeenAccepted = <GenericYesNo>{option: YesNo.NO};
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptAdmitAmountPaidSpec).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate mediation to ccd', () => {
    //Given
    claim.claimantResponse.mediation = <Mediation>{
      noMediationReason: {
        iDoNotWantMediationReason: 'NO_DELAY_IN_HEARING',
      },
      mediationDisagreement: {
        option: YesNo.NO,
      },
    };
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.noMediationReasonLiP).toBe('NO_DELAY_IN_HEARING');
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.hasAgreedFreeMediation).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.mediationDisagreementLiP).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate small claim DQ to ccd', () => {
    //Given
    claim = getClaimantResponseDQ(claim);
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1DQLanguage.court).toBe('WELSH');
    expect(ccdClaim.applicant1DQLanguage.documents).toBe('ENGLISH');
    expect(ccdClaim.applicant1DQVulnerabilityQuestions.vulnerabilityAdjustmentsRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1DQRequestedCourt.requestHearingAtSpecificCourt).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1DQWitnesses.witnessesToAppear).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1ClaimExpertSpecRequired).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1DQExperts.expertRequired).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1DQExperts.details.length).toBe(1);
    expect(ccdClaim.applicant1DQSmallClaimHearing.unavailableDatesRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.giveEvidenceYourSelf).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.applicant1DQLiPExpert.expertReportRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.applicant1DQLiPExpert.expertCanStillExamineDetails).toBe('test');
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.wantPhoneOrVideoHearing).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.whyPhoneOrVideoHearing).toBe('Need Phone hearing');
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.determinationWithoutHearingRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.determinationWithoutHearingReason).toBe('reasonForHearing');
    expect(ccdClaim.applicant1LiPResponse.applicant1DQHearingSupportLip.supportRequirementLip).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate repaymentPlan rejected details and new proposed payment plan', () => {
    //Given
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate : new Date() } ;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1RepaymentOptionForDefendantSpec).toBe(PaymentOptionType.BY_SET_DATE);
  });

  it('should translate repaymentPlan accepted details', () => {
    //Given
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);
  });
});

function getClaimantResponseDQ(claim: Claim): Claim {
  claim.totalClaimAmount = 1500;
  claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
  claim.claimantResponse.directionQuestionnaire.hearing = {
    phoneOrVideoHearing: {
      option: YesNo.YES,
      details: 'Need Phone hearing',
    },
    cantAttendHearingInNext12Months: new GenericYesNo(YesNo.NO),
    supportRequiredList: {option: YesNo.NO},
    whyUnavailableForHearing: {
      reason: 'out of city',
    },
    determinationWithoutHearing: {
      option: YesNo.NO,
      reasonForHearing: 'reasonForHearing',
    },
    specificCourtLocation: <SpecificCourtLocation>{option: YesNo.NO},
  };

  claim.claimantResponse.directionQuestionnaire.experts = {
    expertRequired: true,
    expertReportDetails: {option: YesNo.NO},
    permissionForExpert: new GenericYesNo(YesNo.YES),
    expertCanStillExamine: {
      option: YesNo.YES,
      details: 'test',
    },
    expertDetailsList: mockExpertDetailsList,
    expertEvidence: new GenericYesNo('Yes'),
  };
  claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = new GenericYesNo(YesNo.YES);
  claim.claimantResponse.directionQuestionnaire.witnesses = {
    otherWitnesses: {
      option: YesNo.NO,
    },
  };
  claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = {
    vulnerability: new GenericYesNo(YesNo.NO),
  };
  claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = {
    language: {
      speakLanguage: LanguageOptions.WELSH,
      documentsLanguage: LanguageOptions.ENGLISH,
    },
  };
  return claim;
}
