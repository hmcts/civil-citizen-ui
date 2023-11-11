import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../common/form/models/claimSummarySection';
import {buildSubmitStatus, buildNextStepsSection} from './submitConfirmationBuilder/submitConfirmationBuilder';
import {getNextStepsTitle} from './submitConfirmationBuilder/admissionSubmitConfirmationContent';
import {YesNo} from 'form/models/yesNo';

export const getSubmitConfirmationContent = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const submitStatusSection = buildSubmitStatus(claimId, claim, lang);
  const nextStepsTitle = getNextStepsTitle(lang);
  const nextStepsSection = buildNextStepsSection(claimId, claim, lang);
  return [submitStatusSection, nextStepsTitle, nextStepsSection].flat();
};

export function isDefendantRejectedMediationOrFastTrackClaim(claim: Claim) : boolean {
  return claim.mediation?.mediationDisagreement?.option === YesNo.NO || claim.isFastTrackClaim;
}
