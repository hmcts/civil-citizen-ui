import PaymentOptionType from './paymentOptionType';
import {VALID_PAYMENT_OPTION} from '../../../../validationErrors/errorMessageConstants';
import {IsIn} from 'class-validator';
import {Form} from '../../../form';

export default class PaymentOption extends Form {
  @IsIn(Object.values(PaymentOptionType), {message: VALID_PAYMENT_OPTION})
    paymentType: PaymentOptionType;

  constructor(paymentType?: PaymentOptionType) {
    super();
    this.paymentType = paymentType;
  }
}
