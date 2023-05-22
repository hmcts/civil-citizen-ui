export function caseNumberPrettify(caseNumber: string) {
  return caseNumber.replace(/(.{4})(?! )(?=\S)/g, '$1 ');
}

export function documentIdPrettify(documentId: string) {
  const lastIndex: number = documentId.lastIndexOf('/');
  if (lastIndex !== -1) {
    return documentId.substring(lastIndex + 1);
  }
}
export function documentTypePrettify(fileName: string) {
  return fileName.substring(fileName.lastIndexOf('.') + 1);
}

