import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class DeterminationWithoutHearing {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION_NAC_YDW'})
    option?: string;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsDefined({message: 'ERRORS.TELL_US_WHY'})
  @IsNotEmpty({message: 'ERRORS.TELL_US_WHY'})
    reasonForHearing?: string;

  constructor(option?: string, reasonForHearing?: string) {
    this.option = option;
    this.reasonForHearing = reasonForHearing;
  }
}
