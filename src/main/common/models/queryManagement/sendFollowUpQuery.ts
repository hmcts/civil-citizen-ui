import {IsNotEmpty} from 'class-validator';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';

export class SendFollowUpQuery {
  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_DETAILS'})
  messageDetails: string;

  uploadedFiles: UploadQMAdditionalFile[];

  constructor(messageDetails?: string) {
    this.messageDetails = messageDetails;
    this.uploadedFiles = [];
  }
}
