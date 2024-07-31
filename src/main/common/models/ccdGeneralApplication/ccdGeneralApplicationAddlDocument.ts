export interface CcdGeneralApplicationAddlDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdHearingDocument {
  id: string,
  value: CcdDocumentValue,
}

export interface CcdDocumentValue {
  createdBy: string,
  documentLink: CcdDocument,
  createdDatetime: Date,
}

export interface CcdDocument { 
  document_url: string,
  document_binary_url: string,
  document_filename: string,
  category_id: string,
}
