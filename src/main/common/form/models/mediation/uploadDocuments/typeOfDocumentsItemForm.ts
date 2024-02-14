import {TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {ValidateNested} from 'class-validator';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';

export class TypeOfDocumentsItemForm {
  id: number;
  value: string;
  text: string;
  checked: boolean;
  type: TypeOfMediationDocuments;
  hint?: string;
  @ValidateNested()
    uploadDocuments?: TypeOfDocumentSection[];

  constructor(id: number, value: string, text: string, checked: boolean, type: TypeOfMediationDocuments, hint?: string ) {
    this.id = id;
    this.value = value;
    this.text = text;
    this.checked = checked;
    this.type = type;
    this.hint = hint;
  }
}
