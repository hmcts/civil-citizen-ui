import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  isCaseReadyTrialOrHearing?: IsCaseReadyForm;
}
