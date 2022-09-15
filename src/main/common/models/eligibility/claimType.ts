import {IsDefined} from 'class-validator';
import {ClaimTypeOptions} from './claimTypeOptions';

export class ClaimType {

  @IsDefined({ message: 'ERRORS.SELECT_AN_OPTION' })
    option?: ClaimTypeOptions;

  constructor(option?: ClaimTypeOptions) {
    this.option = option;
  }
}
