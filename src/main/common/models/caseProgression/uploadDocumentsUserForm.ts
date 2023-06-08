import {IsDefined, IsNotEmpty, ValidateNested} from 'class-validator';
import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';
import {IsFileSize} from "form/validators/isFileSize";

export class UploadDocumentsUserForm {
  @ValidateNested()
    documentsForDisclosure?: DocumentsForDisclosure[];
  @ValidateNested()
    disclosureList?: DisclosureList[];

  constructor(documentsForDisclosure?: DocumentsForDisclosure[], disclosureList?: DisclosureList[]) {
    this.documentsForDisclosure = documentsForDisclosure;
    this.disclosureList = disclosureList;

    //todo: add other sections
  }
}

export class DocumentsForDisclosure {
  @IsNotEmpty({message: 'ERRORS.VALID_YOU_MUST_ENTER_TOD'})
    typeOfDocument: string;

  //todo: validate date
  dateDay: string;
  dateMonth: string;
  dateYear: string;

  @ValidateNested()
  @IsDefined({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
}

export class FileUpload {
  fieldname: string;
  originalname: string;
  @IsAllowedMimeType({ message: 'ERRORS.VALID_MIME_TYPE_FILE' })
    mimetype: string;
  buffer: ArrayBuffer;
  @IsFileSize({ message: 'ERRORS.VALID_SIZE_FILE' })
    size: number;
}
export class DisclosureList {
  fileUpload: string;
}
