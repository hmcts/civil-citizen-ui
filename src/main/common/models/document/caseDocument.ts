import {Document} from './document';
import {DocumentType} from './documentType';

export interface CaseDocument {
  createdBy: string;
  documentLink: Document;
  documentName: string;
  documentType: DocumentType;
  documentSize: number;
  createdDatetime: Date;
}
