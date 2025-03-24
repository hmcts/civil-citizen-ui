import {IsDefined, IsNotEmpty, ValidateNested} from 'class-validator';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';

export class CreateQuery {
  @IsNotEmpty({message: 'Enter message subject'})
  messageSubject: string;

  @IsNotEmpty({message: 'Enter message details'})
  messageDetails: string;

  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
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
