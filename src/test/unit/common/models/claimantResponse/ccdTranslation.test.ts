import { Claim } from 'models/claim';
import { translateClaimantResponseDJToCCD } from 'services/translation/claimantResponse/ccdTranslation';
import { YesNo } from 'common/form/models/yesNo';
import { Party } from 'common/models/party';
import { PartyType } from 'common/models/partyType';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'models/claimantResponse';

describe('translate draft claim to ccd version', () => {
  it('should translate applicant 1 to ccd', async () => {
    //Given
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.applicant1.type = PartyType.COMPANY;
    claim.applicant1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);
    //Then
    expect(ccdClaim.applicant1).not.toBeUndefined();
    expect(ccdClaim.applicant1?.companyName).toBe('test');
  });
  it('should translate respondent 1 to ccd', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.type = PartyType.COMPANY;
    claim.respondent1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);
    //Then
    expect(ccdClaim.respondent1).not.toBeUndefined();
    expect(ccdClaim.respondent1?.companyName).toBe('test');
  });

  it('should translate the total claim amount', async () => {
    // given
    const claim = new Claim();
    claim.totalClaimAmount = 100;

    // when
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.totalClaimAmount).toEqual(100);
  });

  it('should translate the partial payment amount when option is Yes', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.partialPaymentAmount).toEqual('1000');
  });

  it('should not translate the partial payment amount when option is No', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.partialPaymentAmount).toBeUndefined();
  });

  it('should translate the payment type selection', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.paymentTypeSelection).toEqual('IMMEDIATELY');
  });

  it('should translate the payment set date when payment option type is BY_SET_DATE', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.paymentSetDate).toEqual('2022-01-01');
  });

  it('should not translate the payment set date when payment option type is not BY_SET_DATE', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.paymentSetDate).toBeUndefined();
  });

  it('should translate the repayment due when option is Yes', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.repaymentDue).toEqual('10');
  });

  it('should not translate the repayment due when option is No', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.repaymentDue).toBeUndefined();
  });

  it('should translate the repayment suggestion when payment option type is INSTALMENTS', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.repaymentSuggestion).toEqual('10000');
  });

  it('should not translate the repayment suggestion when payment option type is not INSTALMENTS', async () => {
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
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // then
    expect(ccdClaim.repaymentSuggestion).toBeUndefined();
  });

  it('should get repaymentSummaryObject for default judgement', async () => {
    const claim = new Claim();
    claim.claimFee = {
      calculatedAmountInPence: 5000,
      code: 'fbeee',
      version: 2,
    };
    claim.totalClaimAmount = 9000;

    // when
    const ccdClaim = await translateClaimantResponseDJToCCD(claim);

    // Normalize strings
    const expectedString = 'The judgment will order the defendants to pay £9050.00, including the claim fee and interest, if applicable, as shown: ### Claim amount £9000 ### Claim fee amount £50 ## Subtotal £9050.00 ## Total still owed £9050.00';
    const normalizedExpectedString = normalizeWhitespace(expectedString);
    const normalizedReceivedString = normalizeWhitespace(ccdClaim.repaymentSummaryObject);

    // then
    expect(normalizedReceivedString).toContain(normalizedExpectedString);
  });
});

function normalizeWhitespace(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}
