import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';

export class DebtPaymentEvidenceService {
  public async saveDebtPaymentEvidence (claimId: string, debtPaymentEvidence: DebtPaymentEvidence) {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();

    // to clear provide details field when other choices are selected
    if (debtPaymentEvidence.evidence !== debtPaymentOptions.NO_EVIDENCE) {
      debtPaymentEvidence.provideDetails = null;
    }
    caseData.certificateOfSatisfactionOrCanceled.debtPaymentEvidence = debtPaymentEvidence;

    await saveDraftClaim(claimId, caseData);
  };
}

export const debtPaymentEvidenceService = new DebtPaymentEvidenceService();
