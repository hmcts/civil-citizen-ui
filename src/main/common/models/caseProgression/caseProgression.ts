import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {Bundle} from 'models/caseProgression/bundles/bundle';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  caseBundles?: Bundle[];
}
