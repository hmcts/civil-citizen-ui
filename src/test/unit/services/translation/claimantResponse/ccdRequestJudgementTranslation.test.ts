import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CaseState} from 'common/form/models/claimDetails';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {translateClaimantResponseRequestDefaultJudgementToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';

describe('Translate claimant ccd request  to ccd version', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
  });

  it('should translate ccj request for judgment admission into the CCD response', () => {
    claim.claimantResponse = {
      ccjRequest : {
        paidAmount: {
          option: YesNo.YES,
          amount: 50,
        },
        ccjPaymentOption: {
          type: PaymentOptionType.INSTALMENTS,
        },
        repaymentPlanInstalments: {
          amount: 100,
        },
      }, 
    } as any;

    const ccdResponse = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': '5000',
      'ccjPaymentPaidSomeOption': 'Yes',
      'partialPayment':'Yes',
      'partialPaymentAmount':'5000',
      'paymentSetDate':undefined,
      'paymentTypeSelection':'REPAYMENT_PLAN',
      'repaymentDue':'NaN',
      'repaymentFrequency':undefined,
      'repaymentSuggestion': '100',
    });
  });

  it('should translate ccj request for judgment admission into the CCD response without paid amount', () => {
    claim.claimantResponse.ccjRequest = {
      paidAmount: {
        option: YesNo.NO,
        amount: 0,
      },
    };
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': null,
      'ccjPaymentPaidSomeOption': 'No',
      'partialPayment':'No',
      'partialPaymentAmount':undefined,
      'paymentSetDate':undefined,
      'paymentTypeSelection':'IMMEDIATELY',
      'repaymentDue':undefined,
      'repaymentFrequency':undefined,
      'repaymentSuggestion': undefined,
    });
  });

  
  it('should not translate ccj request for judgment admission into the CCD response when ccj Request is not present', () => {
    claim.claimantResponse.ccjRequest = {};
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': null,
      'ccjPaymentPaidSomeOption': undefined,
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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

    // then
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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

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
    const ccdClaim = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300);

    // then
    expect(ccdClaim.repaymentSuggestion).toBeUndefined();
  });
});