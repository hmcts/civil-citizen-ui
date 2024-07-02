import {IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from '../../yesNo';

export class HelpWithFees {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_SELECTION_OPTION2'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsNotEmpty({message: 'ERRORS.HELP_WITH_FEES_REFERENCE_REQUIRED'})
    referenceNumber?: string;

  constructor(option?: YesNo, referenceNumber?: string) {
    this.option = option;
    this.referenceNumber = referenceNumber;
  }
}
