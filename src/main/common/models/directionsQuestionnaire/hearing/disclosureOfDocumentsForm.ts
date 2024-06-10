import {
  TypeOfDisclosureDocument
} from "models/directionsQuestionnaire/hearing/disclosureOfDocuments";

export class DisclosureOfDocumentsForm {
  title?: string;
  hint?:string;
  documentsTypeForm: DisclosureOfDocumentsTypeForm[];

  constructor(title?: string, hint?:string) {
    this.title = title;
    this.hint = hint;
    this.documentsTypeForm = [];
  }

  mapFromStringsToDisclosureOfDocumentsForm(strings: string[]): this {
    if(strings === undefined) {
      this.documentsTypeForm.forEach((item) => item.checked = false);
    }else{
      this.documentsTypeForm.forEach((typeOfDocument) => {
        const hasInformation = strings.find((str) => str === typeOfDocument.type);
        typeOfDocument.checked = !!hasInformation;
      });
    }
    return this;
  }
}

export class DisclosureOfDocumentsTypeForm {
  id: number;
  value: string;
  text: string;
  checked: boolean;
  type: TypeOfDisclosureDocument;
  hint?: string;

  constructor(id: number, value: string, text: string, checked: boolean, type: TypeOfDisclosureDocument, hint?: string ) {
    this.id = id;
    this.value = value;
    this.text = text;
    this.checked = checked;
    this.type = type;
    this.hint = hint;
  }
}
