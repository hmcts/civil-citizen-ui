import {ClaimantOrDefendant} from 'models/partyType';
import {OtherTrialInformation} from 'form/models/caseProgression/trialArrangements/OtherTrialInformation';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';

export async function saveOtherTrialInfo (claimId: string, form: OtherTrialInformation, citizenType: ClaimantOrDefendant){
  const claim = await getCaseDataFromStore(claimId);
  if(citizenType == ClaimantOrDefendant.DEFENDANT)
  {
    claim.caseProgression.defendantTrialArrangements.OtherTrialInformation = form.otherInformation;
  } else {
    claim.caseProgression.claimantTrialArrangements.OtherTrialInformation = form.otherInformation;
  }
  await saveDraftClaim(claimId, claim);
}
