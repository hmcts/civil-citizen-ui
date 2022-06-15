import {IsDefined, IsIn} from 'class-validator';
import {OPTION_REQUIRED_RESPONSE} from '../validationErrors/errorMessageConstants';
import {HowMuchHaveYouPaid} from './admission/howMuchHaveYouPaid';
import RejectAllOfClaimType from '../../form/models/rejectAllOfClaimType';

export class RejectAllOfClaim {
  @IsDefined({message: OPTION_REQUIRED_RESPONSE})
  @IsIn(Object.values(RejectAllOfClaimType), {message: OPTION_REQUIRED_RESPONSE})
    option: string;

  howMuchHaveYouPaid?: HowMuchHaveYouPaid;

  constructor(option?: string, howMuchHaveYouPaid?: HowMuchHaveYouPaid) {
    this.option = option;
    this.howMuchHaveYouPaid = howMuchHaveYouPaid;
  }
}
