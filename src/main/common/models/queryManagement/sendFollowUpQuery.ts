import {IsNotEmpty} from 'class-validator';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';

export class SendFollowUpQuery {
  @IsNotEmpty({message: 'ERRORS.QUERY_MANAGEMENT.MESSAGE_DETAILS'})
    messageDetails: string;

  uploadedFiles: UploadQMAdditionalFile[];
  parentId: string;

  constructor(messageDetails?: string) {
    this.parentId = null;
    this.messageDetails = messageDetails;
    this.uploadedFiles = [];
  }
}
