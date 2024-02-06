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
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {Address} from 'form/models/address';
import {PartyType} from 'models/partyType';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {
  createClaimWithFreeTelephoneMediationSection,
  createClaimWithFullRejection,
} from '../../../../utils/mockClaimForCheckAnswers';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';

describe('Translate claimant response to ccd version', () => {
  let claim: Claim = new Claim();
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.respondent1 = new Party();
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.COMPANY,
    };
  });
  it('should translate fullAdmitSetDateAcceptPayment to ccd - partial admission', () => {
    //Given
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = <GenericYesNo>{option: YesNo.NO};
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBeUndefined();

  });
  it('should translate fullAdmitSetDateAcceptPayment to ccd - full admission', () => {
    //Given
    claim.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.ORGANISATION,
    };
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = <GenericYesNo>{option: YesNo.NO};
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBeUndefined();
  });
  it('should set fullAdmitSetDateAcceptPayment (full admission) related ccd fields to undefined', () => {
    //Given
    claim.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.ORGANISATION,
    };
    claim.claimantResponse = undefined;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBeUndefined();
    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBeUndefined();
  });
  it('should set fullAdmitSetDateAcceptPayment (part admission) related ccd fields to undefined', () => {
    //Given
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.ORGANISATION,
    };
    claim.claimantResponse = undefined;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBeUndefined();
    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBeUndefined();
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

  it('should translate signSettlementAgreement to ccd', () => {
    //Given
    claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{
      signed: 'true',
    };
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1LiPResponse.applicant1SignedSettlementAgreement).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1ProceedWithClaim to ccd', () => {

    //Given
    claim.claimantResponse.intentionToProceed = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1ProceedWithClaim).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1PartAdmitConfirmAmountPaidSpec to ccd', () => {

    //Given
    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1PartAdmitConfirmAmountPaidSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1PartAdmitIntentionToSettleClaimSpec to ccd', () => {

    //Given
    claim.respondent1 ={
      responseType: ResponseType.PART_ADMISSION,
    };
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1PartAdmitIntentionToSettleClaimSpec to ccd when Full Defence and paid in less', () => {

    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    claim.claimantResponse = new ClaimantResponse();
    claim.respondent1 ={
      responseType: ResponseType.PART_ADMISSION,
    };
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1PartAdmitIntentionToSettleClaimSpec to ccd when Full Defence and paid in less', () => {

    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1PartAdmitIntentionToSettleClaimSpec to ccd when Full Defence and paid in full', () => {

    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 1000);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate court decision to ccd if exist', () => {
    //Given
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1LiPResponse.claimantCourtDecision).toBe(RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT);
  });

  it('should not translate court decision to ccd if not exist', () => {
    //Given
    claim.claimantResponse.courtDecision = undefined;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1LiPResponse.claimantCourtDecision).toBe(undefined);
  });

  it('should translate applicant1 suggested repaymentPlan INSTALMENTS with MONTH frequency for defendantSpec to ccd', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: new Date(Date.now()),
    };

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec).toBe(100);
    expect(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
    expect(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec).not.toBeNull();
    expect(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec).toBeUndefined();
  });

  it('should translate applicant1 suggested repaymentPlan INSTALMENTS with WEEK frequency for defendantSpec to ccd', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 200,
      repaymentFrequency: 'WEEK',
      firstRepaymentDate: new Date(Date.now()),
    };

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec).toBe(200);
    expect(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_WEEK);
    expect(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec).not.toBeNull();
    expect(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec).toBeUndefined();
  });

  it('should translate applicant1 suggested repaymentPlan INSTALMENTS with TWO_WEEKS frequency for defendantSpec to ccd', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 200,
      repaymentFrequency: 'TWO_WEEKS',
      firstRepaymentDate: new Date(Date.now()),
    };

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec).toBe(200);
    expect(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec).toBe(CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS);
    expect(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec).not.toBeNull();
    expect(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec).toBeUndefined();
  });

  it('should translate applicant1 suggested repaymentPlan SET BY DATE for defendantSpec to ccd', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date();

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec).not.toBeNull();
  });

  it('should translate applicant1 suggested repaymentPlan IMMEDIATELY for defendantSpec to ccd', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec).toBeUndefined();
    expect(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec).toBeUndefined();
  });
});

describe('Translate claimant response to ccd version', () => {
  it('should translate applicant1FullDefenceConfirmAmountPaidSpec to ccd when Full Defence', () => {

    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 1000);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1FullDefenceConfirmAmountPaidSpec).toBe(YesNoUpperCamelCase.YES);
  });

  it('should translate applicant1FullDefenceConfirmAmountPaidSpec to undefined when undefined', () => {

    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 1000);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou = undefined;

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1FullDefenceConfirmAmountPaidSpec).toBe(undefined);
  });

  it('should not translate applicant1FullDefenceConfirmAmountPaidSpec to ccd when not Full Defence', () => {

    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1FullDefenceConfirmAmountPaidSpec).toBe(undefined);
  });

  it('should not translate applicant1FullDefenceConfirmAmountPaidSpec to ccd when not exist', () => {

    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    claim.claimantResponse = new ClaimantResponse();

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1FullDefenceConfirmAmountPaidSpec).toBe(undefined);
  });

  it('should not translate applicant1FullDefenceConfirmAmountPaidSpec to ccd when claim not exist', () => {

    //Given
    const claim = new Claim();

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1FullDefenceConfirmAmountPaidSpec).toBe(undefined);
  });

  it('should translate dq support hearing details', () => {
    //Given
    const claim = new Claim();
    const selectedValueWithContent = { selected: true, content: 'abc' };
    const selectedValue = { selected: true };
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claim.claimantResponse.directionQuestionnaire.hearing = {
      supportRequiredList: {
        option: YesNo.YES,
        items: [{
          fullName: 'expert1',
          hearingLoop: selectedValue,
          languageInterpreter: selectedValueWithContent,
          signLanguageInterpreter: selectedValueWithContent,
          disabledAccess: selectedValue,
          otherSupport: selectedValueWithContent,
        },
        ],
      },
    };

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1DQHearingSupport).toEqual({ supportRequirements: 'Yes', supportRequirementsAdditional: 'expert1 :Disabled access,Hearing loop,Language interpreter:abc,Sign language interpreter:abc,Other support:abc;' });
  });
  it('should translate dq no support hearing details provided', () => {
    //Given
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claim.claimantResponse.directionQuestionnaire.hearing = {
      supportRequiredList: {
        option: YesNo.NO,
      },
    };

    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);

    //Then
    expect(ccdClaim.applicant1DQHearingSupport).toEqual({ supportRequirements: 'No' });
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
