import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {YesNo} from 'form/models/yesNo';
import {CaseDocument} from 'models/document/caseDocument';

export class TrialArrangements {
  isCaseReady?: YesNo;
  hasAnythingChanged?: HasAnythingChangedForm;
  otherTrialInformation?: string;
  trialArrangementsDocument?: TrialArrangementsDocument;
}

export class TrialArrangementsDocument {
  id: string;
  value: CaseDocument;
}
