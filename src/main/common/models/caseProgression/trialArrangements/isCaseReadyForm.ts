import {IsNotEmpty} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class IsCaseReadyForm {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'})
    option?: YesNo;

  constructor(option?: YesNo) {
    this.option = option;
  }
}
