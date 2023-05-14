
export enum DocumentType {
  DISCLOSURE = 'Disclosure',
  WITNESS_EVIDENCE = 'Witness evidence',
  EXPERT_EVIDENCE = 'Expert evidence',
  TRIAL_DOCUMENTS = 'Trial documents',
}
export class TypeOfDocument {
  documentType: DocumentType;
  typeOfDocumentItem: TypeOfDocumentItem[];

  constructor(documentType: DocumentType, TypeOfDocumentItem: TypeOfDocumentItem[]) {
    this.documentType = documentType;
    this.typeOfDocumentItem = TypeOfDocumentItem;
  }
}

export class TypeOfDocumentItem {
  value: string;
  text: string;
  hint: { text: string };
  checked: boolean;
  //TODO add all new fieds in here

  constructor(value: string, text: string, hint: string, checked: boolean) {
    this.value = value;
    this.text = text;
    this.hint = { text:hint };
    this.checked = checked;
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

