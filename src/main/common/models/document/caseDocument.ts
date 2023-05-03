import {Document} from './document';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadFiles,
  EvidenceUploadTrial,
  EvidenceUploadWitness
} from './documentType';

export interface CaseDocument {
  createdBy: string;
  documentLink: Document;
  documentName: string;
  documentType: DocumentType |EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadFiles|EvidenceUploadTrial;
  documentSize: number;
  createdDatetime: Date;
}
