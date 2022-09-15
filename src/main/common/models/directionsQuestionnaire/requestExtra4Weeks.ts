import {IsDefined} from 'class-validator';

export class RequestExtra4weeks {
  @IsDefined({message: 'ERRORS.VALID_TRIED_TO_SETTLE'})
    option?: string;

  constructor(triedToSettle?: string) {
    this.option = triedToSettle;
  }
}