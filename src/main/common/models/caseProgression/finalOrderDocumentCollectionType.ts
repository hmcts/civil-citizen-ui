import {CaseDocument} from 'models/document/caseDocument';

export class FinalOrderDocumentCollection {
  id: string;
  value: CaseDocument;

  constructor(id: string, value: CaseDocument){
    this.id = id;
    this.value = value;
  }
}
