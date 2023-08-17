import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';
import {toCCDDJPaymentOption} from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';

describe('translate payment option to ccd version', ()=> {
  it('should translate pay immediately to ccd version', ()=> {
    //Given
    const immediately = PaymentOptionType.IMMEDIATELY;
    //When
    const result = toCCDDJPaymentOption(immediately);
    //Then
    expect(result).toBe(CCDDJPaymentOption.IMMEDIATELY);
  });
  it('should translate pay by set date option', ()=> {
    //Given
    const bySetDate = PaymentOptionType.BY_SET_DATE;
    //When
    const result = toCCDDJPaymentOption(bySetDate);
    //Then
    expect(result).toBe(CCDDJPaymentOption.SET_DATE);
  });
  it('should translate pay by instalments', ()=> {
    //Given
    const byInstallments = PaymentOptionType.INSTALMENTS;
    //When
    const result = toCCDDJPaymentOption(byInstallments);
    //Then
    expect(result).toBe(CCDDJPaymentOption.REPAYMENT_PLAN);
  });
});
