import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';
import {IsFileSize} from 'form/validators/isFileSize';

export class FileUpload {
  fieldname: string;
  originalname: string;
  @IsAllowedMimeType({ message: 'ERRORS.VALID_MIME_TYPE_FILE' })
  mimetype: string;
  buffer: ArrayBuffer;
  @IsFileSize({ message: 'ERRORS.VALID_SIZE_FILE' })
  size: number;
}
