import {Reason} from './reason';

export class ClaimDetails {
  reason?: Reason;

  constructor(reason?: Reason) {
    this.reason = reason;
  }
}
