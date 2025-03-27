import {IsDefined, IsNotEmpty, ValidateNested} from 'class-validator';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';

export class CreateQuery {
  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_SUBJECT'})
    messageSubject: string;

  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_DETAILS'})
    messageDetails: string;

  @IsDefined({message: 'ERRORS.QUERY_MANAGEMENT.HEARING_RELATED'})
    isHearingRelated: string;

  @ValidateNested()
    fileUpload: FileUpload;

  constructor(messageSubject?: string, messageDetails?: string, isHearingRelated?: string, fileUpload?: FileUpload) {
    this.messageSubject = messageSubject;
    this.messageDetails = messageDetails;
    this.isHearingRelated = isHearingRelated;
    this.fileUpload = fileUpload;
  }

}
