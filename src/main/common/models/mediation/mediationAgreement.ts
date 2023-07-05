import {Document} from 'models/document/document';

export interface MediationAgreement {
  name: string;
  documentType: DocumentType;
  document: Document;
}
