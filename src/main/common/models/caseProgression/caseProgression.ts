import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  claimantTrialArrangements?: TrialArrangements;
  defendantTrialArrangements?: TrialArrangements;
  finalOrderDocumentCollection?: FinalOrderDocumentCollection[];
  defendantDocuments?: UploadDocumentsUserForm;
  claimantDocuments?: UploadDocumentsUserForm;
}
