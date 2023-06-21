import {IsDefined, IsNotEmpty, ValidateNested} from 'class-validator';
import { IsFileSize} from 'form/validators/isFileSize';
import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';


export class UploadDocumentsUserForm {
  @ValidateNested()
    documentsForDisclosure?: TypeOfDocumentSection[];
  @ValidateNested()
    disclosureList?: FileSection[];
  @ValidateNested()
    trialCaseSummary?: FileSection[];
  @ValidateNested()
    trialSkeletonArgument?: FileSection[];
  @ValidateNested()
    trialAuthorities?: FileSection[];
  @ValidateNested()
    trialCosts?: FileSection[];
  @ValidateNested()
    trialDocumentary?: TypeOfDocumentSection[];

  constructor(documentsForDisclosure?: TypeOfDocumentSection[], disclosureList?: FileSection[], trialCaseSummary?: FileSection[], trialSkeletonArgument?: FileSection[], trialAuthorities?: FileSection[], trialCosts?: FileSection[], trialDocumentary?: TypeOfDocumentSection[]) {
    //disclosure sections
    this.documentsForDisclosure = documentsForDisclosure;
    this.disclosureList = disclosureList;

    //trial sections
    this.trialCaseSummary = trialCaseSummary;
    this.trialSkeletonArgument = trialSkeletonArgument;
    this.trialAuthorities = trialAuthorities;
    this.trialCosts = trialCosts;
    this.trialDocumentary = trialDocumentary;
    //todo: add other sections
  }
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

export class FileSection {
  @IsDefined({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;

  constructor(fileUpload: FileUpload) {
    this.fileUpload = fileUpload;
  }
}
export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;

  //todo: validate date
  dateDay: string;
  dateMonth: string;
  dateYear: string;

  @ValidateNested()
  @IsDefined({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;

  constructor(typeOfDocument: string, dateDay: string, dateMonth: string, dateYear: string, fileUpload: FileUpload) {
    this.typeOfDocument = typeOfDocument;
    this.dateDay = dateDay;
    this.dateMonth = dateMonth;
    this.dateYear = dateYear;
    this.fileUpload = fileUpload;
  }
}

