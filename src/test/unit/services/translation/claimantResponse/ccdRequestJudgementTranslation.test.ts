import { CaseState } from 'common/form/models/claimDetails';
import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import {
  translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD,
  translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD,
} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import { Party } from 'models/party';
import { PartyDetails } from 'form/models/partyDetails';
import { buildAddress } from '../../../../utils/mockClaim';
import { PartyType } from 'models/partyType';
import { toCCDParty } from 'services/translation/response/convertToCCDParty';
import { ChooseHowProceed } from 'models/chooseHowProceed';
import { ChooseHowToProceed } from 'form/models/claimantResponse/chooseHowToProceed';
import { GenericYesNo } from 'form/models/genericYesNo';
import { FullAdmission } from 'models/fullAdmission';
import { PaymentIntention } from 'form/models/admission/paymentIntention';
import { PaymentOptionType } from 'form/models/admission/paymentOption/paymentOptionType';
import { CCDClaimantPaymentOption } from 'models/ccdResponse/ccdClaimantPaymentOption';
import {
  CourtProposedPlan,
  CourtProposedPlanOptions,
} from 'form/models/claimantResponse/courtProposedPlan';
import { RepaymentDecisionType } from 'models/claimantResponse/RepaymentDecisionType';
import { PaymentDate } from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import { CcjPaymentOption } from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import { InstalmentFirstPaymentDate } from 'models/claimantResponse/ccj/instalmentFirstPaymentDate';
import { TransactionSchedule } from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {convertDateToStringFormat} from 'common/utils/dateUtils';

describe('Translate claimant ccj request to ccd', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
    claim.applicant1.type = PartyType.INDIVIDUAL;
    claim.applicant1.partyDetails.primaryAddress = buildAddress();
    claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
    claim.respondent1 = claim.applicant1;
    claim.totalClaimAmount = 1000;
  });

  it('should translate ccj request for judgment admission into the CCD response', () => {
    const paymentDate = new Date();
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(
      ChooseHowProceed.REQUEST_A_CCJ,
    );
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(
      YesNo.YES,
    );
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption =
      PaymentOptionType.BY_SET_DATE;
    claim.fullAdmission.paymentIntention.paymentDate = paymentDate;
    claim.claimantResponse.ccjRequest = {
      paidAmount: {
        option: YesNo.YES,
        amount: 50,
      },
    };
    const ccdResponse =
      translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(
        claim,
        300,
      );
    expect(ccdResponse).toEqual({
      ccjJudgmentAmountClaimFee: '300',
      ccjJudgmentLipInterest: '0',
      ccjPaymentPaidSomeAmount: '5000',
      ccjPaymentPaidSomeOption: 'Yes',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
        CCDClaimantPaymentOption.SET_DATE,
      applicant1RequestedPaymentDateForDefendantSpec: {
        paymentSetDate: convertDateToStringFormat(paymentDate),
      },
    });
  });
  it('should translate ccj request for judgment admission into the CCD response without paid amount', () => {
    const paymentDate = new Date();
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(
      ChooseHowProceed.REQUEST_A_CCJ,
    );
    claim.claimantResponse.courtProposedPlan = new CourtProposedPlan(
      CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN,
    );
    claim.claimantResponse.courtDecision =
      RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.fullAdmission = new FullAdmission();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption =
      PaymentOptionType.INSTALMENTS;
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 50,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: paymentDate,
    };
    claim.claimantResponse.ccjRequest = {
      paidAmount: {
        option: YesNo.NO,
        amount: 0,
      },
    };
    const ccdResponse =
      translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(
        claim,
        300,
      );
    expect(ccdResponse).toEqual({
      ccjJudgmentAmountClaimFee: '300',
      ccjJudgmentLipInterest: '0',
      ccjPaymentPaidSomeAmount: null,
      ccjPaymentPaidSomeOption: 'No',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
        CCDClaimantPaymentOption.REPAYMENT_PLAN,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec:
        'ONCE_ONE_MONTH',
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 50,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec:
        convertDateToStringFormat(paymentDate),
      applicant1RequestedPaymentDateForDefendantSpec: {},
    });
  });
});

describe('Translate claimant default ccj request to ccd', () => {
  let claim: Claim;
  const paymentDate = new PaymentDate('2024', '1', '1');
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
    claim.applicant1.type = PartyType.INDIVIDUAL;
    claim.applicant1.partyDetails.primaryAddress = buildAddress();
    claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
    claim.respondent1 = claim.applicant1;
    claim.totalClaimAmount = 1000;
  });

  it('should translate ccj request for judgment admission into the CCD response', () => {
    claim.claimantResponse.ccjRequest = {
      defendantPaymentDate: paymentDate,
      ccjPaymentOption: new CcjPaymentOption(PaymentOptionType.BY_SET_DATE),
      paidAmount: {
        option: YesNo.YES,
        amount: 50,
      },
    };
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': '5000',
      'ccjPaymentPaidSomeOption': 'Yes',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
      CCDClaimantPaymentOption.SET_DATE,
      applicant1RequestedPaymentDateForDefendantSpec: {
        paymentSetDate: convertDateToStringFormat(paymentDate.date),
      },
      'partialPayment':'Yes',
      'partialPaymentAmount':'5000',
      'paymentSetDate': paymentDate.date,
      'paymentTypeSelection':'SET_DATE',
      'repaymentDue':'NaN',
      'repaymentFrequency':undefined,
      'repaymentSuggestion': undefined,
    });
  });
  it('should translate ccj request for judgment admission into the CCD response without paid amount', () => {
    const firstPaymentDate: Record<string, string> = {};
    firstPaymentDate['year'] = '2024';
    firstPaymentDate['month'] = '1';
    firstPaymentDate['day'] = '1';
    claim.claimantResponse.ccjRequest = {
      ccjPaymentOption: new CcjPaymentOption(PaymentOptionType.INSTALMENTS),
      repaymentPlanInstalments: {
        firstPaymentDate: new InstalmentFirstPaymentDate(firstPaymentDate),
        paymentFrequency: TransactionSchedule.WEEK,
        amount: 50,
      },
      paidAmount: {
        option: YesNo.NO,
        amount: 0,
      },
    };
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': null,
      'ccjPaymentPaidSomeOption': 'No',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
      CCDClaimantPaymentOption.REPAYMENT_PLAN,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: 'ONCE_ONE_WEEK',
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 50,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: convertDateToStringFormat(new Date(2024, 0, 1)),
      applicant1RequestedPaymentDateForDefendantSpec: {},
      'partialPayment': 'No',
      'partialPaymentAmount': undefined,
      'paymentSetDate': undefined,
      'paymentTypeSelection': 'REPAYMENT_PLAN',
      'repaymentDue': undefined,
      'repaymentFrequency': 'ONCE_ONE_WEEK',
      'repaymentSuggestion': '50',
    });
  });

  it('should not translate ccj request for judgment admission into the CCD response when ccj Request is not present', () => {
    claim.claimantResponse = new ClaimantResponse();
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': null,
      'ccjPaymentPaidSomeOption': undefined,
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
      CCDClaimantPaymentOption.IMMEDIATELY,
      applicant1RequestedPaymentDateForDefendantSpec: {},
      'partialPayment':undefined,
      'partialPaymentAmount':undefined,
      'paymentSetDate':undefined,
      'paymentTypeSelection':'IMMEDIATELY',
      'repaymentDue':undefined,
      'repaymentFrequency':undefined,
      'repaymentSuggestion': undefined,
    });
  });

  it('should translate the partial payment amount when option is Yes', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        paidAmount: {
          option: YesNo.YES,
          amount: 10,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.partialPaymentAmount).toEqual('1000');
  });

  it('should not translate the partial payment amount when option is No', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        paidAmount: {
          option: YesNo.NO,
          amount: 10,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.partialPaymentAmount).toBeUndefined();
  });

  it('should not translate the partial payment amount when option is not present', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {},
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.partialPayment).toBeUndefined();
    expect(ccdClaim.partialPaymentAmount).toBeUndefined();
  });

  it('should translate the payment type selection', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        ccjPaymentOption: {
          type: PaymentOptionType.IMMEDIATELY,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.paymentTypeSelection).toEqual('IMMEDIATELY');
  });

  it('should translate the payment set date when payment option type is BY_SET_DATE', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        ccjPaymentOption: {
          type: PaymentOptionType.BY_SET_DATE,
        },
        defendantPaymentDate: {
          date: '2022-01-01',
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.paymentSetDate).toEqual('2022-01-01');
  });

  it('should not translate the payment set date when payment option type is not BY_SET_DATE', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        ccjPaymentOption: {
          type: PaymentOptionType.IMMEDIATELY,
        },
        defendantPaymentDate: {
          date: '2022-01-01',
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.paymentSetDate).toBeUndefined();
  });

  it('should translate the repayment due when option is Yes', () => {
  // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        paidAmount: {
          option: YesNo.YES,
          totalAmount: 20,
          amount: 10,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    expect(ccdClaim.repaymentDue).toEqual('10');
  });

  it('should not translate the repayment due when option is No', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        paidAmount: {
          option: YesNo.NO,
          totalAmount: 20,
          amount: 10,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.repaymentDue).toBeUndefined();
  });

  it('should translate the repayment suggestion when payment option type is INSTALMENTS', () => {
  // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        ccjPaymentOption: {
          type: PaymentOptionType.INSTALMENTS,
        },
        repaymentPlanInstalments: {
          amount: 100,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.repaymentSuggestion).toEqual('100');
  });

  it('should not translate the repayment suggestion when payment option type is not INSTALMENTS', () => {
    // given
    const claim = new Claim();
    claim.claimantResponse = {
      ccjRequest: {
        ccjPaymentOption: {
          type: PaymentOptionType.IMMEDIATELY,
        },
        repaymentPlanInstalments: {
          amount: 100,
        },
      },
    } as any;

    // when
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);

    // then
    expect(ccdClaim.repaymentSuggestion).toBeUndefined();
  });
});
