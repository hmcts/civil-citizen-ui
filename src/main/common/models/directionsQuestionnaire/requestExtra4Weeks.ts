import {IsDefined} from 'class-validator';

export class RequestExtra4weeks {
  @IsDefined({message: 'ERRORS.VALID_REQUEST_EXTRA_4_WEEKS'})
    option?: string;

  constructor(triedToSettle?: string) {
    this.option = triedToSettle;
  }
}