import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUpload?: Date;
  defendantLastUpload?: Date;
}
