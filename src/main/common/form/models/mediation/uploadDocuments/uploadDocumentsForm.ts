import {ValidateNested} from 'class-validator';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';

export class UploadDocumentsForm {
  @ValidateNested()
    documentsForYourStatement?: TypeOfDocumentSection[];
  @ValidateNested()
    documentsForDocumentsReferred?: TypeOfDocumentSection[];

}
