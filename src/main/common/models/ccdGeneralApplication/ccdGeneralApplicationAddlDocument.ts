import { DocumentType } from '../document/documentType';

export interface CcdGeneralApplicationAddlDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdHearingDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdHearingNoticeDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdGeneralOrderDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdGaDraftDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdConsentOrderDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdDocumentValue {
  createdBy: string,
  documentLink: CcdDocument,
  createdDatetime?: Date,
  documentName?: string,
  documentType?: DocumentType,
}

export interface CcdDocument {
  document_url: string,
  document_binary_url: string,
  document_filename: string,
  category_id: string,
}
