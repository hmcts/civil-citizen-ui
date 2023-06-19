import {IsNotEmpty, ValidateNested} from 'class-validator';

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

export class TypeOfDocumentSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})
    typeOfDocument: string;

  //todo: validate date
  dateDay: string;
  dateMonth: string;
  dateYear: string;

  fileUpload: string; //todo: get and validate files
}

export class FileOnlySection {
  fileUpload: string; //todo: get and validate file
}
