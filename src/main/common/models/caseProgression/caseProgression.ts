import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  isCaseReadyTrialOrHearing?: IsCaseReadyForm;
  claimantTrialArrangements?: TrialArrangements;
  defendantTrialArrangements?: TrialArrangements;
}
