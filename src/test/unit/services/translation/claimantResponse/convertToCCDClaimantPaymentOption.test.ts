import {PaymentOptionType} from "form/models/admission/paymentOption/paymentOptionType";
import {toCCDClaimantPaymentOption} from "services/translation/claimantResponse/convertToCCDClaimantPaymentOption";
import {CCDClaimantPaymentOption} from "models/ccdResponse/ccdClaimantPaymentOption";

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
