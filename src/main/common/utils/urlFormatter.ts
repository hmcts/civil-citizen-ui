import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';

export function constructResponseUrlWithIdParams(id: string, path: string, index?: number | string): string {
  // Replace :id in the path with the provided id
  let url = path.replace(/(:id)/i, id);

  // Append ?index=${index} if index is defined
  if (index !== undefined) {
    url += `?index=${index}`;
  }

  return url;
}

export function constructResponseUrlWithIdAndAppIdParams(id: string, appId: string, path: string): string {
  return path.replace(/(:id)/i, id).replace(/(:appId)/i, appId);
}

export function constructDocumentUrlWithIdParamsAndDocumentId(id: string, documentId: string, path: string): string{
  return path.replace(/(:id)/i, id).replace(/(:documentId)/i, documentId);
}

export function constructUrlWithNotEligibleReason(path: string, reason: NotEligibleReason): string {
  return `${path}?reason=${reason}`;
}

