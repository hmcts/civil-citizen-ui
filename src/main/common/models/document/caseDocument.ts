import {Document} from './document';
import {DocumentType} from './documentType';

export interface CaseDocument {
  document: Document,
  documentName: string,
  documentType: DocumentType,
  documentSize: number,
  createdDatetime: Date,
  createdBy: string
}

