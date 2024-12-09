import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GenericYesNo} from 'form/models/genericYesNo';

export class GaHelpWithFees {
  applyHelpWithFees?: GenericYesNo;
  helpWithFeesRequested: string;
  helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm;
  applyAdditionalHelpWithFees?: GenericYesNo;
  applicationFee?: string;
  additionalFee?: string;

  constructor(applyHelpWithFees?: GenericYesNo, helpWithFeesRequested?: string, helpFeeReferenceNumberForm?: ApplyHelpFeesReferenceForm, applyAdditionalHelpWithFees?: GenericYesNo) {
    this.applyHelpWithFees = applyHelpWithFees;
    this.helpWithFeesRequested = helpWithFeesRequested;
    this.helpFeeReferenceNumberForm = helpFeeReferenceNumberForm;
    this.applyAdditionalHelpWithFees = applyAdditionalHelpWithFees;
  }
}
