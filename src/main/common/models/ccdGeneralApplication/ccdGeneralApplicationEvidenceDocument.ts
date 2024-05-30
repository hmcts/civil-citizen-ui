export interface CcdGeneralApplicationEvidenceDocument {
  value: CcdDocument,
}

export interface CcdDocument {
  document_url: string,
  document_binary_url: string,
  document_filename: string,
  category_id: string,
}
