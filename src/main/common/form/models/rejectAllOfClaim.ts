import {IsDefined, IsIn} from 'class-validator';
import {OPTION_REQUIRED_RESPONSE} from '../validationErrors/errorMessageConstants';

import RejectAllOfClaimType from '../../form/models/rejectAllOfClaimType';

export class RejectAllOfClaim {
  @IsDefined({message: OPTION_REQUIRED_RESPONSE})
  @IsIn(Object.values(RejectAllOfClaimType), {message: OPTION_REQUIRED_RESPONSE})
    option: string;

  constructor(option?: string) {
    this.option = option;
  }
}
