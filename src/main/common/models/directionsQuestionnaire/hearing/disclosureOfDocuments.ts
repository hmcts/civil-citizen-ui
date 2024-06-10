import {DisclosureOfDocumentsForm} from "models/directionsQuestionnaire/hearing/disclosureOfDocumentsForm";

export class DisclosureOfDocuments {
  documentsTypeChosen: DisclosureDocumentType[];

  constructor(documentsTypeChosen?: DisclosureDocumentType[]) {
    this.documentsTypeChosen = documentsTypeChosen;
  }

  mapDisclosureOfDocumentsFormToDisclosureOfDocuments(documentsTypeForm: DisclosureOfDocumentsForm): this {
    const arrayOfTypeOfDocumentsForm = documentsTypeForm.documentsTypeForm;
    const checkedObject = arrayOfTypeOfDocumentsForm.filter(item => item.checked === true);

    this.documentsTypeChosen = checkedObject.map((item) =>
      new DisclosureDocumentType(item.type, item.checked));
    return this;
  }
}

export class DisclosureDocumentType {
  documentType: TypeOfDisclosureDocument;
  checked: boolean;

  constructor(documentType: TypeOfDisclosureDocument, checked: boolean) {
    this.documentType = documentType;
    this.checked = checked;
  }
}

export enum TypeOfDisclosureDocument {
  ELECTRONIC = 'ELECTRONIC_DOCUMENTS',
  NON_ELECTRONIC = 'NON_ELECTRONIC_DOCUMENTS'
}

