import {CCDClaim} from 'models/civilClaimResponse';
import {TrialArrangements, TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
import {CaseRole} from 'form/models/caseRoles';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';

export const toCUITrialArrangements = (ccdClaim: CCDClaim, isClaimant: boolean): TrialArrangements => {
  if (ccdClaim) {
    const trialArrangements: TrialArrangements = new TrialArrangements();
    if (isClaimant) {
      if (ccdClaim.trialReadyDocuments) {
        const claimantTrialArrangementsDocuments : TrialArrangementsDocument[] = ccdClaim.trialReadyDocuments.filter(doc => formatOwnedBy(doc.value.ownedBy) === CaseRole.CLAIMANT || formatOwnedBy(doc.value.ownedBy) === CaseRole.APPLICANTSOLICITORONE);
        claimantTrialArrangementsDocuments.sort((a, b) => new Date(b.value.createdDatetime).getTime() - new Date(a.value.createdDatetime).getTime());
        if (claimantTrialArrangementsDocuments.length > 0) {
          trialArrangements.trialArrangementsDocument =  claimantTrialArrangementsDocuments[0];
        }
      }

      if (ccdClaim.trialReadyApplicant) {
        trialArrangements.isCaseReady = toCUIYesNo(ccdClaim.trialReadyApplicant);
      }
      if (ccdClaim.applicantRevisedHearingRequirements?.revisedHearingRequirements || ccdClaim.applicantRevisedHearingRequirements?.revisedHearingComments) {
        trialArrangements.hasAnythingChanged = new HasAnythingChangedForm(toCUIYesNo(ccdClaim?.applicantRevisedHearingRequirements?.revisedHearingRequirements), ccdClaim?.applicantRevisedHearingRequirements?.revisedHearingComments);
      }
      if (ccdClaim.applicantHearingOtherComments?.hearingOtherComments) {
        trialArrangements.otherTrialInformation = ccdClaim?.applicantHearingOtherComments?.hearingOtherComments;
      }
    } else {
      if (ccdClaim.trialReadyDocuments) {
        const defendantTrialArrangementsDocuments : TrialArrangementsDocument[] = ccdClaim.trialReadyDocuments.filter(doc => formatOwnedBy(doc.value.ownedBy) === CaseRole.DEFENDANT);
        defendantTrialArrangementsDocuments.sort((a, b) => new Date(b.value.createdDatetime).getTime() - new Date(a.value.createdDatetime).getTime());
        if (defendantTrialArrangementsDocuments.length > 0) {
          trialArrangements.trialArrangementsDocument = defendantTrialArrangementsDocuments[0];
        }
      }

      if (ccdClaim.trialReadyRespondent1) {
        trialArrangements.isCaseReady = toCUIYesNo(ccdClaim.trialReadyRespondent1);
      }
      if (ccdClaim.respondent1RevisedHearingRequirements?.revisedHearingRequirements || ccdClaim.respondent1RevisedHearingRequirements?.revisedHearingComments) {
        trialArrangements.hasAnythingChanged = new HasAnythingChangedForm(toCUIYesNo(ccdClaim.respondent1RevisedHearingRequirements.revisedHearingRequirements), ccdClaim.respondent1RevisedHearingRequirements.revisedHearingComments);
      }
      if (ccdClaim.respondent1HearingOtherComments?.hearingOtherComments) {
        trialArrangements.otherTrialInformation = ccdClaim.respondent1HearingOtherComments.hearingOtherComments;
      }
    }
    return Object.keys(trialArrangements).length > 0 ? trialArrangements : undefined;
  }
};

function formatOwnedBy(ownedBy: CaseRole) {
  return ownedBy?.toString().startsWith('[') ? ownedBy : `[${ownedBy}]`;
}
