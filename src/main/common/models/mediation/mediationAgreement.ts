import {Document} from 'models/document/document';
import {DocumentType} from 'models/document/documentType';
export interface MediationAgreement {
  name: string;
  documentType: DocumentType;
  document: Document;
}
