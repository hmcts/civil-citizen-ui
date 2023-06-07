import {IsNotEmpty, ValidateNested} from 'class-validator';

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

  //todo: validate files
  fileUpload: object;
}

export class DisclosureList {
  fileUpload: string;
}
