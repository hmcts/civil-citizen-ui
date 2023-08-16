import {CCDClaim} from 'models/civilClaimResponse';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';

const claimantPrefix = 'claimant';
const defendantPrefix = 'defendant';

export const toCUITrialArrangements = (ccdClaim: CCDClaim, isClaimant: boolean): TrialArrangements => {
  if (ccdClaim) {
    const trialArrangements: TrialArrangements = new TrialArrangements();
    trialArrangements.trialArrangementsDocument = isClaimant ? ccdClaim.trialReadyDocuments.find(doc => doc.value.documentName.toLowerCase().includes(claimantPrefix))
      : ccdClaim.trialReadyDocuments.find(doc => doc.value.documentName.toLowerCase().includes(defendantPrefix));
    return trialArrangements;
  }
};
