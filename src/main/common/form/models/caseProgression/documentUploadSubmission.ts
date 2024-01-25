import {IsNotEmpty} from 'class-validator';

export class DocumentUploadSubmissionForm {

  @IsNotEmpty({message: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_VALIDATION'})
    signed?: boolean;

  constructor(signed?: boolean) {
    this.signed = signed;
  }
}
