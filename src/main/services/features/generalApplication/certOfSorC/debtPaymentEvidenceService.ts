import {DebtPaymentEvidence} from 'routes/features/generalApplication/certOfSorc/debtPaymentEvidence';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {debtPaymentOptions} from "routes/features/generalApplication/certOfSorc/debtPaymentOptions";

export const saveDebtPaymentEvidence = async (claimId: string, debtPaymentEvidence: DebtPaymentEvidence) => {
  const caseData = await getCaseDataFromStore(claimId);
  caseData.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();

  // to clear provide details field when other choices are selected
  if (debtPaymentEvidence.evidence !== debtPaymentOptions.NO_EVIDENCE) {
    debtPaymentEvidence.provideDetails = null;
  }
  caseData.certificateOfSatisfactionOrCanceled.debtPaymentEvidence = debtPaymentEvidence;

  await saveDraftClaim(claimId, caseData);
}
