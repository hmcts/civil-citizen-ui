import PaymentOption
  from '../../../../../../main/common/form/models/admission/paymentOption/paymentOption';
import {Validator} from 'class-validator';
import {VALID_PAYMENT_OPTION} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import PaymentOptionType
  from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';

const validator = new Validator();
describe('Payment Option validation', () => {
  it('should have errors when paymentType is undefined', () => {
    //Given
    const paymentOption = new PaymentOption();
    //When
    const errors = validator.validateSync(paymentOption);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isIn).toBe(VALID_PAYMENT_OPTION);
  });
  it('should not have errors when paymentType is selected', () => {
    //Given
    const paymentOption = new PaymentOption(PaymentOptionType.BY_SET_DATE);
    //When
    const errors = validator.validateSync(paymentOption);
    //Then
    expect(errors.length).toBe(0);
  });
});
