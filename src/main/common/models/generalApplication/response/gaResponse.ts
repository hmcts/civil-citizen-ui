import {YesNo} from 'form/models/yesNo';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';

export class GaResponse {
  wantToUploadDocuments?: YesNo;
  uploadEvidenceDocuments?: UploadGAFiles[];

  constructor(wantToUploadDocuments?: YesNo, uploadEvidenceDocuments?: UploadGAFiles) {
    this.wantToUploadDocuments = wantToUploadDocuments;
    this.uploadEvidenceDocuments = uploadEvidenceDocuments ? [uploadEvidenceDocuments] : [];
  }
}

