export function caseNumberPrettify(caseNumber: string) {
  return caseNumber.replace(/(.{4})(?! )(?=\S)/g, '$1 ');
}

export function documentIdExtractor(documentBinaryUrl: string){
  const regex = /\/([\w-]+)\/binary$/;
  const match = regex.exec(documentBinaryUrl);
  return match[1];
}

export function removeWhiteSpacesIfNoText(text:string): string {
  if(!text.replace(/\s/g, '').length) {
    return '';
  } else {
    return text;
  }
}
