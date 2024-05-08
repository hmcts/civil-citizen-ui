import {IsDefined} from 'class-validator';
import {YesNo} from '../form/models/yesNo';

export class DelayedFlight {
  @IsDefined({message: 'ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED'})
    option?: YesNo;
  
    constructor(option?: YesNo) {
      this.option = option;
    }
}
