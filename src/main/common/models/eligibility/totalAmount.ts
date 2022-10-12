import {IsDefined} from 'class-validator';
import {TotalAmountOptions} from './totalAmountOptions';

export class TotalAmount {
  @IsDefined({ message: 'ERRORS.SELECT_AN_OPTION' })
    option?: TotalAmountOptions;

  constructor(option?: TotalAmountOptions) {
    this.option = option;
  }
}
