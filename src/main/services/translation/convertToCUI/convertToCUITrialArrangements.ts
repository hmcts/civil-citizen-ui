import {CCDClaim} from 'models/civilClaimResponse';
import {TrialArrangements, TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
import {CaseRole} from 'form/models/caseRoles';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';

export const toCUITrialArrangements = (ccdClaim: CCDClaim, isClaimant: boolean): TrialArrangements => {
  if (ccdClaim ) {
    const trialArrangements: TrialArrangements = new TrialArrangements();
    if (isClaimant) {
      const claimantTrialArrangementsDocuments : TrialArrangementsDocument[] = ccdClaim.trialReadyDocuments.filter(doc =>`[${doc.value.ownedBy}]` === CaseRole.CLAIMANT || `[${doc.value.ownedBy}]` === CaseRole.APPLICANTSOLICITORONE);
      claimantTrialArrangementsDocuments.sort((a, b) => new Date(b.value.createdDatetime).getTime() - new Date(a.value.createdDatetime).getTime());
      trialArrangements.trialArrangementsDocument = claimantTrialArrangementsDocuments[0];
    } else {
      const defendantTrialArrangementsDocuments : TrialArrangementsDocument[] = ccdClaim.trialReadyDocuments.filter(doc => `[${doc.value.ownedBy}]` === CaseRole.DEFENDANT);
      defendantTrialArrangementsDocuments.sort((a, b) => new Date(b.value.createdDatetime).getTime() - new Date(a.value.createdDatetime).getTime());
      trialArrangements.trialArrangementsDocument = defendantTrialArrangementsDocuments[0];
      trialArrangements.isCaseReady = toCUIYesNo(ccdClaim?.trialReadyRespondent1);
      trialArrangements.hasAnythingChanged = new HasAnythingChangedForm(toCUIYesNo(ccdClaim?.respondent1RevisedHearingRequirements?.revisedHearingRequirements), ccdClaim?.respondent1RevisedHearingRequirements?.revisedHearingComments);
      trialArrangements.otherTrialInformation = ccdClaim?.respondent1HearingOtherComments?.hearingOtherComments;
    }
    return trialArrangements;
  }
};
