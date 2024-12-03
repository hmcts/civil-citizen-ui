import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator';
import { FileUpload } from '../caseProgression/uploadDocumentsUserForm';
import { CaseDocument } from '../document/caseDocument';

export class UploadGAFiles {
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2' })
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(fileUpload?: FileUpload) {
    this.fileUpload = fileUpload;
  }

}

