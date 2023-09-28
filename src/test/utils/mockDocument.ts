const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';

const document = {document_filename: 'name', document_url: 'url', document_binary_url:`http://dm-store:8080/documents/${binary}/binary`};

export function getMockDocument(fileName?: string, url?: string, binaryUrl?: string) {
  document.document_filename = fileName ? fileName : document.document_filename;
  document.document_url = url ? url : document.document_url;
  document.document_binary_url = binaryUrl ? binaryUrl : document.document_binary_url;
  return document;
}

export function getMockDocumentBinary() {
  return binary;
}
