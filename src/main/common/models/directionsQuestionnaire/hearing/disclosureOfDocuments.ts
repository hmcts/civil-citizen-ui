export class DisclosureOfDocuments {
  documentsTypeChosen: string[];

  constructor(documentsTypeChosen?: string[]) {
    this.documentsTypeChosen = documentsTypeChosen;
  }

  hasField(disclosureDocumentType: TypeOfDisclosureDocument) {
    return this.documentsTypeChosen?.includes(disclosureDocumentType);
  }
}

export enum TypeOfDisclosureDocument {
  ELECTRONIC = 'ELECTRONIC_DOCUMENTS',
  NON_ELECTRONIC = 'NON_ELECTRONIC_DOCUMENTS'
}

