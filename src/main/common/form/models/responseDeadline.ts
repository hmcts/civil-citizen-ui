import {IsDefined} from 'class-validator';

export enum ResponseOptions {
  ALREADY_AGREED = 'already-agreed',
  NO = 'no',
  REQUEST_REFUSED = 'request-refused',
  YES = 'yes',
}

export class ResponseDeadline {
  @IsDefined({message: 'ERRORS.SELECT_REQUEST'})
    option?: ResponseOptions;

  constructor(responseOption?: ResponseOptions) {
    this.option = responseOption;
  }
}