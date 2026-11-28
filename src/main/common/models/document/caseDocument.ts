import {Document} from './document';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadTrial,
  EvidenceUploadWitness, OtherManageUpload, WithoutPrejudiceUpload,
} from './documentType';
import {CaseRole} from 'form/models/caseRoles';

export interface CaseDocument {
  createdBy: string;
  documentLink: Document;
  documentName: string;
  documentType: DocumentType|EvidenceUploadWitness|EvidenceUploadDisclosure|EvidenceUploadTrial|OtherManageUpload|WithoutPrejudiceUpload;
  documentSize: number;
  createdDatetime: Date;
  ownedBy?: CaseRole;
}
