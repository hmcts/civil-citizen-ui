import {TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';

export class TypeOfDocumentsItemForm {
  id: number;
  value: string;
  text: string;
  checked: boolean;
  type: TypeOfMediationDocuments;
  hint?: string;

  constructor(id: number, value: string, text: string, checked: boolean, type: TypeOfMediationDocuments, hint?: string ) {
    this.id = id;
    this.value = value;
    this.text = text;
    this.checked = checked;
    this.type = type;
    this.hint = hint;
  }
}
