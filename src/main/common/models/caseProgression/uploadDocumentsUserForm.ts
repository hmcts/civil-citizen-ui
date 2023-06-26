import {IsDefined, IsNotEmpty, ValidateIf, ValidateNested} from 'class-validator';
import { IsFileSize} from 'form/validators/isFileSize';
import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';
import {CaseDocument} from 'models/document/caseDocument';

export class UploadDocumentsUserForm {
  @ValidateNested()
    documentsForDisclosure?: TypeOfDocumentSection[];
  @ValidateNested()
    disclosureList?: FileOnlySection[];
  @ValidateNested()
    trialCaseSummary?: FileOnlySection[];
  @ValidateNested()
    trialSkeletonArgument?: FileOnlySection[];
  @ValidateNested()
    trialAuthorities?: FileOnlySection[];
  @ValidateNested()
    trialCosts?: FileOnlySection[];
  @ValidateNested()
    trialDocumentary?: TypeOfDocumentSection[];

  constructor(documentsForDisclosure?: TypeOfDocumentSection[], disclosureList?: FileOnlySection[], trialCaseSummary?: FileOnlySection[], trialSkeletonArgument?: FileOnlySection[], trialAuthorities?: FileOnlySection[], trialCosts?: FileOnlySection[], trialDocumentary?: TypeOfDocumentSection[]) {
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

export class FileOnlySection {
  @ValidateIf((object, value) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsDefined({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;

  caseDocument: CaseDocument;
}
export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;

  //todo: validate date
  dateDay: string;
  dateMonth: string;
  dateYear: string;

  @ValidateIf((object, value) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsDefined({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;

  caseDocument: CaseDocument;
}

