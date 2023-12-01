import {toCCDClaimantPaymentOption} from 'services/translation/claimantResponse/convertToCCDClaimantPaymentOption';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'models/claimantResponse';
import {Claim} from 'models/claim';

describe('translate Claimant Payment Option to CCD model', () => {
  it('payment option is IMMEDIATELY should return IMMEDIATELY', () => {
    // GIVEN
    // WHEN
    const result = toCCDClaimantPaymentOption(PaymentOptionType.IMMEDIATELY);
    // THEN
    expect(result).toEqual(CCDClaimantPaymentOption.IMMEDIATELY);
  });

  it('payment option is Set Date should return Set Date', () => {
    // GIVEN
    // WHEN
    const result = toCCDClaimantPaymentOption(PaymentOptionType.BY_SET_DATE);
    // THEN
    expect(result).toEqual(CCDClaimantPaymentOption.SET_DATE);
  });

  it('payment option is Instalments should return Repayment Plan', () => {
    // GIVEN
    // WHEN
    const result = toCCDClaimantPaymentOption(PaymentOptionType.INSTALMENTS);
    // THEN
    expect(result).toEqual(CCDClaimantPaymentOption.REPAYMENT_PLAN);
  });
});
describe('ClaimantSuggestedRepaymentOption', () => {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  const PAYMENT_AMOUNT = 100;
  const REPAYMENT_FREQUENCY = 'WEEK';
  const FIRST_PAYMENT_DATE = new Date('2024-02-14T00:00:00.000');
  const repaymentPlan = {
    paymentAmount: PAYMENT_AMOUNT,
    repaymentFrequency: REPAYMENT_FREQUENCY,
    firstRepaymentDate: new Date(FIRST_PAYMENT_DATE),
  };
  claim.claimantResponse.suggestedPaymentIntention = {
    paymentOption: PaymentOptionType.INSTALMENTS,
    paymentDate: new Date(),
    repaymentPlan: repaymentPlan,
  };
  it('should return true with pay by INSTALMENTS', () => {
    //When
    const result = claim.claimantResponse.isClaimantSuggestedPayByInstalments;
    //Then
    expect(result).toBe(true);
  });
  it('should return true with pay by set date', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const result = claim.claimantResponse.isClaimantSuggestedPayByDate;
    //Then
    expect(result).toBe(true);
  });
  it('should return false with pay by IMMEDIATELY', () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = claim.claimantResponse.isClaimantSuggestedPayByInstalments;
    //Then
    expect(result).toBe(false);
  });
});