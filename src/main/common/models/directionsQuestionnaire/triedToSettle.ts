import {IsDefined} from 'class-validator';

export class TriedToSettle {
  @IsDefined({message: 'ERRORS.VALID_TRIED_TO_SETTLE'})
    option?: string;

  constructor(triedToSettle?: string) {
    this.option = triedToSettle;
  }
}
