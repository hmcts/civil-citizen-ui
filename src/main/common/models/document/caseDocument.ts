import {Document} from './document';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from './documentType';

export interface CaseDocument {
  createdBy: string;
  documentLink: Document;
  documentName: string;
  documentType: DocumentType|EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadTrial;
  documentSize: number;
  createdDatetime: Date;
}
