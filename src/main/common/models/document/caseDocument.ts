import {Document} from './document';
import {DocumentType} from './documentType';

export class CaseDocument {
  document: Document;
  documentName: string;
  documentType: DocumentType;
  documentSize: number;
  createdDatetime: Date;
  createdBy: string;

  getDocumentSizeAsKB():string {
    return (this.documentSize / 1000).toFixed(0);
  }
}
