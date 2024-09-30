import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import { DebtPaymentEvidence } from 'models/generalApplication/debtPaymentEvidence';

export class CertificateOfSatisfactionOrCancellation {
  defendantFinalPaymentDate?: DefendantFinalPaymentDate;
  debtPaymentEvidence?: DebtPaymentEvidence;

  constructor(defendantFinalPaymentDate?: DefendantFinalPaymentDate, debtPaymentEvidence?: DebtPaymentEvidence) {
    this.defendantFinalPaymentDate = defendantFinalPaymentDate;
    this.debtPaymentEvidence = debtPaymentEvidence;
  }
}
