export interface CcdGeneralApplicationDirectionsOrderDocument {
  value: CcdDocument,
}

export interface CcdDocument {
  documentType: string,
  documentLink: CcdDocumentLink,
}

export interface CcdDocumentLink {
  document_url: string,
  document_binary_url: string,
  document_filename: string,
  category_id: string,
}
