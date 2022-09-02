import PaymentOptionType from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {CcdPaymentOption, toCCDPaymentOption} from '../../../../../main/common/models/ccdResponse/paymentOptionCCD';

describe('translate payment option to ccd version', ()=> {
  it('should translate pay immediately to ccd version', ()=> {
    //Given
    const immediately = PaymentOptionType.IMMEDIATELY;
    //When
    const result = toCCDPaymentOption(immediately);
    //Then
    expect(result).toBe(CcdPaymentOption.IMMEDIATELY);
  });
  it('should translate pay by set date option', ()=> {
    //Given
    const bySetDate = PaymentOptionType.BY_SET_DATE;
    //When
    const result = toCCDPaymentOption(bySetDate);
    //Then
    expect(result).toBe(CcdPaymentOption.SET_DATE);
  });
  it('should translate pay by instalments', ()=> {
    //Given
    const byInstallments = PaymentOptionType.INSTALMENTS;
    //When
    const result = toCCDPaymentOption(byInstallments);
    //Then
    expect(result).toBe(CcdPaymentOption.REPAYMENT_PLAN);
  });
});
