import {IsDefined, IsIn} from 'class-validator';
import {OPTION_REQUIRED} from '../validationErrors/errorMessageConstants';

import RejectAllOfClaimType from '../../form/models/rejectAllOfClaimType';

export class RejectAllOfClaim {
  @IsDefined({message: OPTION_REQUIRED})
  @IsIn(Object.values(RejectAllOfClaimType), {message: OPTION_REQUIRED})
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
