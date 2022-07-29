import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from '../../form/models/yesNo';

export class DeterminationWithoutHearing {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    isDeterminationWithoutHearing?: string;

  @ValidateIf(o => o.isDeterminationWithoutHearing === YesNo.NO)
  @IsDefined({message: 'ERRORS.TELL_US_WHY'})
  @IsNotEmpty({message: 'ERRORS.TELL_US_WHY'})
    reasonForHearing?: string;

  constructor(isDeterminationWithoutHearing?: string, reasonForHearing?: string) {
    this.isDeterminationWithoutHearing = isDeterminationWithoutHearing;
    this.reasonForHearing = reasonForHearing;
  }
}
