import { HelpWithFees } from "./helpWithFees";
import { Reason } from "./reason";


export class ClaimDetails {
  reason?: Reason;
  helpWithFees?: HelpWithFees;

  constructor(reason?: Reason, helpWithFees?: HelpWithFees) {
    this.reason = reason;
    this.helpWithFees = helpWithFees;
  }
}