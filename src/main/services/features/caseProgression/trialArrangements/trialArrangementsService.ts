import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';
import {YesNo} from 'form/models/yesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {OtherTrialInformation} from 'form/models/caseProgression/trialArrangements/otherTrialInformation';

export const getIsCaseReadyForm = (claim: Claim): IsCaseReadyForm => {
  let isCaseReady: YesNo;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    isCaseReady = claim.caseProgression?.claimantTrialArrangements?.isCaseReady;
  } else {
    isCaseReady = claim.caseProgression?.defendantTrialArrangements?.isCaseReady;
  }
  return new IsCaseReadyForm(isCaseReady);
};

export const getHasAnythingChangedForm = (claim: Claim): HasAnythingChangedForm => {
  let hasAnythingChanged: HasAnythingChangedForm;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    hasAnythingChanged = claim.caseProgression?.claimantTrialArrangements?.hasAnythingChanged;
  } else {
    hasAnythingChanged = claim.caseProgression?.defendantTrialArrangements?.hasAnythingChanged;
  }
  return hasAnythingChanged;
};

export const getOtherInformationForm = (claim: Claim): OtherTrialInformation => {
  let otherTrialInformation: string;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    otherTrialInformation = claim.caseProgression?.claimantTrialArrangements?.otherTrialInformation;
  } else {
    otherTrialInformation = claim.caseProgression?.defendantTrialArrangements?.otherTrialInformation;
  }
  return new OtherTrialInformation(otherTrialInformation);
};

export const getNameTrialArrangements = (claim: Claim): string => {
  return claim.caseRole == CaseRole.CLAIMANT ? 'claimantTrialArrangements' : 'defendantTrialArrangements';
};
