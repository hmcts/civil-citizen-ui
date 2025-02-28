import {CCDClaim} from 'common/models/civilClaimResponse';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {TimeLineDocument, Document} from 'common/models/document/document';
import { InterestClaimFromType, InterestEndDateType } from 'common/form/models/claimDetails';
import { CCDInterestType } from 'common/models/ccdResponse/ccdInterestType';
import { CCDSameRateInterestSelection, CCDSameRateInterestType } from 'common/models/ccdResponse/ccdSameRateInterestSelection';
import {CCDAddress} from 'common/models/ccdResponse/ccdAddress';
import {CCDParty} from 'common/models/ccdResponse/ccdParty';
import {PartyType} from 'common/models/partyType';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDDJPaymentOption} from 'common/models/ccdResponse/ccdDJPaymentOption';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';
import {CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {CCDRejectAllOfClaimType} from 'models/ccdResponse/ccdRejectAllOfClaimType';
import { CCDRepaymentPlanFrequency } from 'common/models/ccdResponse/ccdRepaymentPlan';
import { CCDEvidenceType } from 'common/models/ccdResponse/ccdEvidence';
import { EvidenceItem } from 'common/form/models/evidence/evidenceItem';
import { EvidenceType } from 'common/models/evidence/evidenceType';

const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const emailCCD = 'test@test.com';

const addressCCD: CCDAddress = {
  AddressLine1: 'Street test',
  AddressLine2: '1',
  AddressLine3: '1A',
  PostTown: 'test',
  PostCode: 'sl11gf',
  Country: 'test',
  County: 'test',
};

const getPartyIndividualCCD = (): CCDParty => {
  return {
    companyName: undefined,
    individualDateOfBirth: undefined,
    individualTitle: title,
    individualFirstName: firstName,
    individualLastName: lastName,
    organisationName: undefined,
    partyEmail: emailCCD,
    partyPhone: phoneCCD,
    primaryAddress: addressCCD,
    soleTraderDateOfBirth: undefined,
    soleTraderTitle: undefined,
    soleTraderFirstName: undefined,
    soleTraderLastName: undefined,
    soleTraderTradingAs: undefined,
    type: PartyType.INDIVIDUAL,
  };
};

describe('translateCCDCaseDataToCUIModel', () => {
  it('should return undefined if ccdClaim', () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles).toBe(undefined);
  });

  it('should return undefined if witness appear is undefined', () => {
    //Given
    const input: CCDClaim = {
      servedDocumentFiles: {
        timelineEventUpload: [
          <TimeLineDocument>{
            id: '6f5daf35-e492-4f89-891c-bbd948263653',
            value: <Document>{
              category_id: 'detailsOfClaim',
              document_url:
                'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
              document_filename: 'timeline-event-summary.pdf',
              document_binary_url:
                'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary',
            },
          },
        ],
      },
    };
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles.category_id).toBe(
      'detailsOfClaim',
    );
    expect(output.specClaimTemplateDocumentFiles.document_binary_url).toBe(
      'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary',
    );
    expect(output.specClaimTemplateDocumentFiles.document_filename).toBe(
      'timeline-event-summary.pdf',
    );
    expect(output.specClaimTemplateDocumentFiles.document_url).toBe(
      'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
    );
  });

  it('should return interest values to cui fromm ccd', () => {
    const input: CCDClaim = {
      interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE,
      interestClaimOptions: CCDInterestType.SAME_RATE_INTEREST,
      interestClaimUntil: InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE,
      interestFromSpecificDate: '2023-01-01',
      interestFromSpecificDateDescription: 'ss',
      sameRateInterestSelection: {
        sameRateInterestType: CCDSameRateInterestType.SAME_RATE_INTEREST_8_PC,
      } as CCDSameRateInterestSelection,
    };
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.interest).toBeDefined();
    expect(output.interest.interestEndDate).toEqual(
      InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE,
    );
    expect(output.interest.interestClaimFrom).toEqual(
      InterestClaimFromType.FROM_A_SPECIFIC_DATE,
    );
    expect(output.interest.interestClaimOptions).toEqual(
      CCDInterestType.SAME_RATE_INTEREST,
    );
    expect(output.interest.sameRateInterestSelection).toEqual({
      sameRateInterestType: CCDSameRateInterestType.SAME_RATE_INTEREST_8_PC,
      differentRate: undefined,
      reason: undefined,
    });
  });

  it('should translate full defence fields to CUI model', () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
      applicant1ProceedWithClaim: YesNoUpperCamelCase.YES,
    };

    //When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.intentionToProceed).toEqual(
      new GenericYesNo(YesNo.YES),
    );
  });

  it('should translate partial admission field to CUI model', () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: 'PART_ADMISSION',
      applicant1AcceptPartAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
      applicant1AcceptAdmitAmountPaidSpec: YesNoUpperCamelCase.YES,
      specDefenceAdmittedRequired: YesNoUpperCamelCase.YES,
    };

    //When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.partialAdmission.alreadyPaid).toEqual(
      new GenericYesNo(YesNo.YES),
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES),
    );
    expect(claim.claimantResponse.hasPartAdmittedBeenAccepted).toEqual(
      new GenericYesNo(YesNo.YES),
    );
  });

  it('should translate full admission field to CUI model', () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
      defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
      applicant1AcceptFullAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.fullAdmission.paymentIntention.paymentOption).toEqual(
      PaymentOptionType.IMMEDIATELY,
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES),
    );
  });

  it('should translate full admission field to CUI model', () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
      defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
      applicant1AcceptFullAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.fullAdmission.paymentIntention.paymentOption).toEqual(
      PaymentOptionType.IMMEDIATELY,
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES),
    );
  });

  it('should translate partial payment to CUI model', () => {
    //Given
    const input: CCDClaim = {
      partialPayment: YesNoUpperCamelCase.YES,
      partialPaymentAmount: 'IMMEDIATELY',
      paymentTypeSelection: CCDDJPaymentOption.IMMEDIATELY,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.ccjRequest.ccjPaymentOption.type).toEqual(
      PaymentOptionType.IMMEDIATELY,
    );
  });

  it('should translate payment date to CUI model', () => {
    const deadlineDate: Date = new Date(2023, 2, 20);
    //Given
    const input: CCDClaim = {
      respondToClaimAdmitPartLRspec : {
        whenWillThisAmountBePaid: deadlineDate,
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.respondentPaymentDeadline).toEqual(deadlineDate);
  });

  it('should return undefined for undefined payment date', () => {
    //Given
    const input: CCDClaim = {
      respondToClaimAdmitPartLRspec : {
        whenWillThisAmountBePaid: undefined,
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.respondentPaymentDeadline).toEqual(undefined);
  });

  it('should return undefined for undefined claim admit object', () => {
    //Given
    const input: CCDClaim = {
      respondToClaimAdmitPartLRspec : undefined,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.respondentPaymentDeadline).toEqual(undefined);
  });

  it('should translate paymentDate to CUI model', () => {
    //Given
    const paymentDate = new Date('2023-12-07');
    const input: CCDClaim = {
      applicant1RequestedPaymentDateForDefendantSpec : {
        paymentSetDate: paymentDate.toString(),
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.suggestedPaymentIntention.paymentDate).toEqual(paymentDate);
  });

  it('should translate claimantResponse CourtDecisionPlan to CUI model', () => {
    //Given
    const input: CCDClaim = {
      applicant1LiPResponse : {
        claimantResponseOnCourtDecision: CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN,
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.courtProposedPlan.decision).toEqual(CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN);
  });

  it('should translate claimantResponse CourtDecisionDate to CUI model', () => {
    //Given
    const input: CCDClaim = {
      applicant1LiPResponse: {
        claimantResponseOnCourtDecision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE,
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.courtProposedDate.decision).toEqual(CourtProposedDateOptions.JUDGE_REPAYMENT_DATE);
  });

  it('should translate totalInterest when InterestClaimOptionsType is BREAK_DOWN_INTEREST', () => {
    //Given
    const input: CCDClaim = {
      interestClaimOptions: CCDInterestType.BREAK_DOWN_INTEREST,
      breakDownInterestTotal: 1000,
      breakDownInterestDescription: 'break down interest',
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    expect(claim.interest.totalInterest.amount).toEqual(1000);
    expect(claim.interest.totalInterest.reason).toEqual('break down interest');
  });

  it('should translate claimant mediation to CUI model for undefined', () => {
    //Given
    const input: CCDClaim = {
      applicant1ClaimMediationSpecRequiredLip : undefined,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.mediation).toEqual(undefined);
  });

  it('should translate claimant mediation to CUI model for having value', () => {
    //Given
    const input: CCDClaim = {
      applicant1ClaimMediationSpecRequiredLip : {
        companyTelephoneOptionMediationLiP: YesNoUpperCamelCase.NO,
      },
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.mediation.companyTelephoneNumber.option).toContain(YesNo.NO);
  });

  it('should translate claimant mediation to CUI model for having value', () => {
    //Given
    const input: CCDClaim = {
      respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
      defenceRouteRequired : CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED,
      totalClaimAmount: 100,
      respondToClaim: {
        howMuchWasPaid: 10000,
      },
      applicant1PartAdmitIntentionToSettleClaimSpec: YesNoUpperCamelCase.YES,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled.option).toEqual(YesNo.YES);
  });

  it('should translate claimant mediation to undefined for not paid already route', () => {
    //Given
    const input: CCDClaim = {
      respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
      defenceRouteRequired : CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled).toEqual(undefined);
  });

  it('should translate claimant mediation to CUI model for having value', () => {
    //Given
    const input: CCDClaim = undefined;

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled).toEqual(undefined);
  });

  it('should translate claimant suggestedPaymentIntention repaymentplan to CUI model for having value', () => {
    //Given
    const input: CCDClaim = {
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 1000,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: '2024-06-01',
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    const repaymentPlan = {
      paymentAmount : 1000,
      repaymentFrequency : 'MONTH',
      firstRepaymentDate : new Date('2024-06-01'),
    };

    expect(claim.claimantResponse.suggestedPaymentIntention.repaymentPlan).toEqual(repaymentPlan);
  });

  it('should translate claimant suggested immediate repayment deadline date to CUI model for having value', () => {
    //Given
    const paymentDate = new Date('2024-04-30');
    const input: CCDClaim = {
      applicant1SuggestPayImmediatelyPaymentDateForDefendantSpec : paymentDate,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.suggestedImmediatePaymentDeadLine).toEqual(paymentDate);
  });

  it('should translate claimant evidence to CUI model for having value', () => {
    //Given
    const input: CCDClaim = {
      speclistYourEvidenceList: [
        {
          'id': '339536de-eeb8-4b74-968d-4b9d02c00ef7',
          'value': {
            evidenceType: CCDEvidenceType.OTHER,
            otherEvidence: 'test other',
          },
        },
      ],
    };

    const evidenceCUI: EvidenceItem[] = [
      {
        type: EvidenceType.OTHER,
        description: 'test other',
      },
    ];

    // When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantEvidence.evidenceItem).toEqual(evidenceCUI);
  });

  it('should translate the respondent general app details', () => {
    //Given
    const dateString = new Date().toISOString();
    const input: CCDClaim = {
      respondentSolGaAppDetails: [
        {
          id: '1234',
          value: {
            generalApplicationType: 'Strike out',
            caseState: 'awaiting respondent response',
            caseLink: {
              CaseReference: '1234567',
            },
            generalAppSubmittedDateGAspec: dateString,
          },
        },
      ],
    };

    // When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.respondentGaAppDetails).toEqual([{ generalAppTypes: ['STRIKE_OUT'], gaApplicationId: '1234567', caseState: 'awaiting respondent response', generalAppSubmittedDateGAspec: dateString }]);
  });
});
