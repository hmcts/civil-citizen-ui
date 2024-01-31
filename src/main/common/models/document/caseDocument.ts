import {Document} from './document';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from './documentType';
import {CaseRole} from 'form/models/caseRoles';

export interface CaseDocument {
  createdBy: string;
  documentLink: Document;
  documentName: string;
  documentType: DocumentType|EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadTrial;
  documentSize: number;
  createdDatetime: Date;
  ownedBy?: CaseRole;
}
