import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {
  CCDTrialArrangementDefendent,
  CCDTrialArrangementsHearingRequirements,
  CCDTrialArrangementsOtherComments,
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Claim} from 'models/claim';

export const toCCDTrialUpdatedHearingRequirements = (hasAnythingChangedForm: HasAnythingChangedForm | undefined): CCDTrialArrangementsHearingRequirements => {
  if (!hasAnythingChangedForm) return undefined;
  return {
    revisedHearingRequirements: toCCDYesNo(hasAnythingChangedForm.option),
    revisedHearingComments: hasAnythingChangedForm.textArea,
  };
};

export const toCCDTrialOtherComments = (otherComments: string | undefined): CCDTrialArrangementsOtherComments => {
  if (!otherComments) return undefined;
  return {
    hearingOtherComments: otherComments,
  };
};

export const translateDraftTrialArrangementsToCCD = (claim: Claim): CCDTrialArrangementDefendent => {
  return {
    trialReadyRespondent1: toCCDYesNo(claim.caseProgression?.defendantTrialArrangements?.isCaseReady),
    respondent1RevisedHearingRequirements: toCCDTrialUpdatedHearingRequirements(claim.caseProgression?.defendantTrialArrangements?.hasAnythingChanged),
    respondent1HearingOtherComments: toCCDTrialOtherComments(claim.caseProgression?.defendantTrialArrangements?.otherTrialInformation),
  };
};
