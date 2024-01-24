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

export function convertToArrayOfStrings(data: string | string[]): string[] {
  if (typeof data === 'string') {
    // If it's a string, convert it to an array of characters
    return Array.of(data);
  } else if (Array.isArray(data)) {
    // If it's already an array, return it as is
    return data;
  }
}
