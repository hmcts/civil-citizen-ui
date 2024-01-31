import {IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class HasAnythingChangedForm {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'})
    option?: YesNo;

  @ValidateIf(o => o.option == YesNo.YES)
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_SUPPORT'})
    textArea?: string;

  constructor(option?: YesNo, textArea?: string) {
    this.option = option;
    this.textArea = textArea;
  }
}
