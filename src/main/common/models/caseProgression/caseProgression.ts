import {CaseDocument} from 'models/document/caseDocument';

export class CaseProgressionDocuments {
  id: string;
  value: CaseDocument;

  constructor(id?: string, value?: CaseDocument) {
    this.id = id;
    this.value = value;
  }
}

export class CaseProgression {
  caseProgressionDocuments ?: CaseProgressionDocuments[];
  constructor(caseProgressionDocuments?: CaseProgressionDocuments[]) {
    this.caseProgressionDocuments = caseProgressionDocuments;
  }

}
