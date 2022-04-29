import {IsDefined} from 'class-validator';
import {VALID_YES_NO_OPTION} from '../../../../common/form/validationErrors/errorMessageConstants';

export class FreeMediation {
  @IsDefined({ message: VALID_YES_NO_OPTION })
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
