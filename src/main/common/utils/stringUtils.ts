import {isUsablePathSegment} from 'common/utils/routeParamUtils';

export function caseNumberPrettify(caseNumber: string) {
  return caseNumber.replace(/(.{4})(?! )(?=\S)/g, '$1 ');
}

export function documentIdExtractor(documentBinaryUrl?: string | null): string | null {
  if (!isUsablePathSegment(documentBinaryUrl)) {
    return null;
  }
  const match = /\/([\w-]+)\/binary$/.exec(documentBinaryUrl.trim());
  const documentId = match?.[1];
  return isUsablePathSegment(documentId) ? documentId : null;
}

export function generalApplicationDocumentIdExtractor(documentBinaryUrl: string){
  try {
    const parsedUrl = new URL(documentBinaryUrl);

    const pathname = parsedUrl.pathname;

    const segments = pathname.split('/');
    const document_id = segments.pop();

    return document_id || null;
  } catch (e) {
    return null;
  }
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
