import {IsNotEmpty} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class IsCaseReadyForm {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_IS_CASE_READY'})
    option?: YesNo;

  constructor(option?: YesNo) {
    this.option = option;
  }
}
