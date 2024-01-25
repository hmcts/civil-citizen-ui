import {IsNotEmpty, ValidateIf, ValidateNested} from 'class-validator';
import {DateInputFields, FileUpload, TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';

export class UploadDocumentsForm {
  @ValidateNested()
    documentsForYourStatement?: TypeOfDocumentYourNameSection[];
  @ValidateNested()
    documentsForDocumentsReferred?: TypeOfDocumentSection[];

  constructor(documentsForYourStatement?: TypeOfDocumentYourNameSection[], documentsForDocumentsReferred?: TypeOfDocumentSection[]) {
    this.documentsForYourStatement = documentsForYourStatement;
    this.documentsForDocumentsReferred = documentsForDocumentsReferred;
  }
}

export class TypeOfDocumentYourNameSection {
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_YOUR_NAME'})
    typeOfDocument: string;
  @ValidateNested()
    dateInputFields: DateInputFields;
  @ValidateNested()
  @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '' )
  @IsNotEmpty({message: 'ERRORS.VALID_CHOOSE_THE_FILE'})
    fileUpload: FileUpload;
  caseDocument: CaseDocument;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputFields(day, month, year);
  }
}
