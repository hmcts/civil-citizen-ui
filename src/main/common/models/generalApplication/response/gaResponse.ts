import { RespondentAgreement } from './respondentAgreement';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {YesNo} from 'form/models/yesNo';

export class GaResponse {
  respondentAgreement?: RespondentAgreement;
  wantToUploadDocuments?: YesNo;
  uploadEvidenceDocuments?: UploadGAFiles[];

  constructor(respondentAgreement?: RespondentAgreement, wantToUploadDocuments?: YesNo, uploadEvidenceDocuments?: UploadGAFiles) {
    this.respondentAgreement = respondentAgreement;
    this.wantToUploadDocuments = wantToUploadDocuments;
    this.uploadEvidenceDocuments = uploadEvidenceDocuments ? [uploadEvidenceDocuments] : [];
  }
}