import { Claim } from 'models/claim';
import { translateClaimantResponseDJToCCD } from 'services/translation/claimantResponse/ccdTranslation';
import { YesNo } from 'common/form/models/yesNo';
import { Party } from 'common/models/party';
import { PartyType } from 'common/models/partyType';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'models/claimantResponse';

describe('translate draft claim to ccd version', () => {
  it('should translate applicant 1 to ccd', () => {
    //Given
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.applicant1.type = PartyType.COMPANY;
    claim.applicant1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = translateClaimantResponseDJToCCD(claim);
    //Then
    expect(ccdClaim.applicant1).not.toBeUndefined();
    expect(ccdClaim.applicant1?.companyName).toBe('test');
  });
  it('should translate respondent 1 to ccd', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.type = PartyType.COMPANY;
    claim.respondent1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = translateClaimantResponseDJToCCD(claim);
    //Then
    expect(ccdClaim.respondent1).not.toBeUndefined();
    expect(ccdClaim.respondent1?.companyName).toBe('test');
  });

  it('should translate the total claim amount', () => {
    // given
    const claim = new Claim();
    claim.totalClaimAmount = 100;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.totalClaimAmount).toEqual(100);
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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as unknown as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as unknown as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

    // then
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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

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
    } as ClaimantResponse;

    // when
    const ccdClaim = translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.repaymentSuggestion).toBeUndefined();
  });
});
