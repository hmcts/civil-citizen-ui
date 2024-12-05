import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator';
import { FileUpload } from '../caseProgression/uploadDocumentsUserForm';
import { CaseDocument } from '../document/caseDocument';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';

export class UploadN245GAFiles {
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE' })
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(n245Files?: UploadGAFiles) {
    this.fileUpload = n245Files.fileUpload;
    this.caseDocument = n245Files.caseDocument;
  }

}

