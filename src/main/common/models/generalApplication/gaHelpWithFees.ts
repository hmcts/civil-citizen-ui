import {YesNo} from 'common/form/models/yesNo';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';

export class GaHelpWithFees {
  applyHelpWithFees?: YesNo;
  helpWithFeesRequested: string;
  helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm;

  constructor(applyHelpWithFees?: YesNo, helpWithFeesRequested?: string, helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm) {
    this.applyHelpWithFees = applyHelpWithFees;
    this.helpWithFeesRequested = helpWithFeesRequested;
    this.helpFeeReferenceNumberForm = helpFeeReferenceNumberForm;
  }
}
