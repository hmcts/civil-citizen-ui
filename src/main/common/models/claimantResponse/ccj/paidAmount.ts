import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {HowMuchDoYouOwe} from '../../../form/models/admission/partialAdmission/howMuchDoYouOwe';
import {YesNo} from '../../../form/models/yesNo';

export class PaidAmount {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    details?: HowMuchDoYouOwe;

  constructor(option?: YesNo, details?: HowMuchDoYouOwe) {
    this.option = option;
    this.details = option === YesNo.YES ? details : undefined;
  }
}
