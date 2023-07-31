import {IsNotEmpty} from 'class-validator';

export class IsCaseReadyForm {
  @IsNotEmpty({message: 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'})
    option?: string;

  constructor(option?: string) {
    this.option = option;
  }
}
