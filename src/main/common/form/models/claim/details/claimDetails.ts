import {Reason} from './reason';
import {HelpWithFees} from './helpWithFees';

export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;

  constructor(reason?: Reason, helpWithFees?: HelpWithFees) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
  }
}
