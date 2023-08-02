import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {
  CCDTrialArrangementsHearingRequirements,
  CCDTrialArrangementsOtherComments
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

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
