import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {
  CcdGeneralApplicationEvidenceDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';

export interface CcdGeneralApplicationCertOfSC {
  defendantFinalPaymentDate?: Date,
  debtPaymentEvidence?: DebtPaymentEvidence,
  proofOfDebtDoc?: CcdGeneralApplicationEvidenceDocument[];
}
