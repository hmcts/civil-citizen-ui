import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

export class DebtPaymentEvidenceService {
  public async saveDebtPaymentEvidence (req: AppRequest, claimId: string, redisKey: string, debtPaymentEvidence: DebtPaymentEvidence) {
    const caseData = await getClaimById(claimId, req, true);
    caseData.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();

    // to clear provide details field when other choices are selected
    if (debtPaymentEvidence.evidence !== debtPaymentOptions.NO_EVIDENCE) {
      debtPaymentEvidence.provideDetails = null;
    }
    caseData.certificateOfSatisfactionOrCanceled.debtPaymentEvidence = debtPaymentEvidence;

    await saveDraftClaim(redisKey, caseData);
  }
}

export const debtPaymentEvidenceService = new DebtPaymentEvidenceService();
