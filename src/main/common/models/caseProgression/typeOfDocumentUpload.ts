
export enum DocumentType {
  DISCLOSURE = 'Disclosure',
  WITNESS_EVIDENCE = ' Witness evidence',
  EXPERT_EVIDENCE = 'Expert evidence',
  TRIAL_DOCUMENTS = 'Trial documents',
}
export class TypeOfDocument {
  documentType: DocumentType;
  TypeOfDocumentItem: TypeOfDocumentItem[];

  constructor(documentType: DocumentType, TypeOfDocumentItem: TypeOfDocumentItem[]) {
    this.documentType = documentType;
    this.TypeOfDocumentItem = TypeOfDocumentItem;
  }
}

export class TypeOfDocumentItem {
  tile: string;
  subtitle: string;
  //TODO add all new fieds in here

  constructor(tile: string, subtitle: string) {
    this.tile = tile;
    this.subtitle = subtitle;
  }
}
export class TypeOfDocumentUpload {
  caseReference: string;
  ClaimantDefendantName: string;
  typeOfDocument: TypeOfDocument[];

  constructor(caseReference: string, ClaimantDefendantName: string, typeOfDocument: TypeOfDocument[]) {
    this.caseReference = caseReference;
    this.ClaimantDefendantName = ClaimantDefendantName;
    this.typeOfDocument = typeOfDocument;
  }
}

