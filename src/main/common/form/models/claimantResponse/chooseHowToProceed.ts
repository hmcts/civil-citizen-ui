import {IsDefined} from 'class-validator';
import {ChooseHowProceed} from 'models/chooseHowProceed';

export class ChooseHowToProceed {
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
    option?: ChooseHowProceed;

  constructor(option?: ChooseHowProceed) {
    this.option = option;
  }
}
