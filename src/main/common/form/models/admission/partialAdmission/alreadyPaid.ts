import {IsDefined} from 'class-validator';

export class AlreadyPaid {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    option?: string;

  constructor(alreadyPaid: string) {
    this.option = alreadyPaid;
  }
}
