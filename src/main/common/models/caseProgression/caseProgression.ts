import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {Bundle} from 'models/caseProgression/bundles/bundle';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  claimantTrialArrangements?: TrialArrangements;
  defendantTrialArrangements?: TrialArrangements;
  caseBundles?: Bundle[];
}
