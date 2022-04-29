import {IsDefined} from 'class-validator';
import {VALID_YES_NO_SELECTION} from '../../../../../common/form/validationErrors/errorMessageConstants';

export class AlreadyPaid {
  @IsDefined({message: VALID_YES_NO_SELECTION})
    option?: string;

  constructor(alreadyPaid: string) {
    this.option = alreadyPaid;
  }
}
