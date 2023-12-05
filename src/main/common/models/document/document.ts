export interface Document {
  document_url: string,
  document_filename: string,
  document_binary_url: string,
  category_id?: string;
}

export interface TimeLineDocument {
  id: string;
  value: Document;
}

export interface ServedDocumentFiles {
  timelineEventUpload: TimeLineDocument[]
}
