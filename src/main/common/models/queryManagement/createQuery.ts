import {IsDefined, IsNotEmpty, MaxLength, ValidateIf, ValidateNested} from 'class-validator';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';

export class CreateQuery {
  @MaxLength(200, {message: 'ERRORS.QUERY_MANAGEMENT.MORE_THAN_200'})
  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_SUBJECT'})
    messageSubject: string;

  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_DETAILS'})
    messageDetails: string;

  @IsDefined({message: 'ERRORS.QUERY_MANAGEMENT.HEARING_RELATED'})
    isHearingRelated: string;

  uploadedFiles: UploadQMAdditionalFile[];

  constructor(messageSubject?: string, messageDetails?: string, isHearingRelated?: string, fileUpload?: FileUpload, uploadedFiles?: FileUpload[]) {
    this.messageSubject = messageSubject;
    this.messageDetails = messageDetails;
    this.isHearingRelated = isHearingRelated;
    this.uploadedFiles = [];
  }

}

export class UploadQMAdditionalFile {
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
  @IsNotEmpty({message: 'ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(fileUpload?: FileUpload, caseDocument?: CaseDocument) {
    this.fileUpload = fileUpload;
    this.caseDocument = caseDocument;
  }

}
