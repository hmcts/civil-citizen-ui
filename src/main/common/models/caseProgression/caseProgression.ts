import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {UploadDocumentsUserForm} from "models/caseProgression/uploadDocumentsUserForm";

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  defendantDocuments?: UploadDocumentsUserForm;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
}
