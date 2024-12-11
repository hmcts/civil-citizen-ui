
export interface CcdGeneralApplicationDirectionsOrderDocument {
  id?: string,
  value: CcdDocument,
}

export interface CcdDocument {
  documentType: string,
  documentLink: CcdDocumentLink,
  createdDatetime?: Date,
  documentName?: string,
}

export interface CcdDocumentLink {
  document_url: string,
  document_binary_url: string,
  document_filename: string,
  category_id: string,
}
