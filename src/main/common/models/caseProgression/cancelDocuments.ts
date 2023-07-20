import {IsNotEmpty} from 'class-validator';
import {YesNo} from '../../form/models/yesNo';

export class CancelDocuments {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_NAC_YDW'})
    option?: YesNo;

  constructor(option?: YesNo) {
    this.option = option;
  }
}
