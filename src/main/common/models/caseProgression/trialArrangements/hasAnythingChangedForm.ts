import {IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class HasAnythingChangedForm {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'})
    option?: YesNo;

  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_SUPPORT'})
  @ValidateIf(o => o.option.VALID_YES_NO_SELECTION.YES )
    textArea?: string;

  constructor(option?: YesNo, textArea?: string) {
    this.option = option;
    this.textArea = textArea;
  }
}
