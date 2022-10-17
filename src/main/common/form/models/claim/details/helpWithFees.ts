import { GenericYesNo } from "../../genericYesNo";

export class HelpWithFees {
  helpWithFeesReferenceOption?: GenericYesNo;

  constructor(helpWithFeesReferenceOption?: GenericYesNo) {
    this.helpWithFeesReferenceOption = helpWithFeesReferenceOption;
  }
}