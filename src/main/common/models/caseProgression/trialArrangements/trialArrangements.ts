import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {YesNo} from 'form/models/yesNo';

export class TrialArrangements{
  isCaseReady?: YesNo;
  hasAnythingChanged?: HasAnythingChangedForm;
  otherTrialInformation?: string;
}
