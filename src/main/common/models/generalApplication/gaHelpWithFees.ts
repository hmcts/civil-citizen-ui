import {YesNo} from 'common/form/models/yesNo';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';

export class GaHelpWithFees {
  applyHelpWithFees?: YesNo;
  helpWithFeesRequested: string;
  helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm;
  applyAdditionalHelpWithFees?: YesNo;

  constructor(applyHelpWithFees?: YesNo, helpWithFeesRequested?: string, helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm,
    applyAdditionalHelpWithFees?: YesNo) {
    this.applyHelpWithFees = applyHelpWithFees;
    this.helpWithFeesRequested = helpWithFeesRequested;
    this.helpFeeReferenceNumberForm = helpFeeReferenceNumberForm;
    this.applyAdditionalHelpWithFees = applyAdditionalHelpWithFees;
  }
}
