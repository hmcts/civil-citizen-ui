import {NotEligibleReason} from '../../common/form/models/eligibility/NotEligibleReason';

export function constructResponseUrlWithIdParams(id: string, path: string): string{
  return path.replace(/(:id)/i, id);
}

export function constructResponseUrlWithIdAndAppIdParams(id: string, appId: string, path: string): string {
  return path.replace(/(:id)/i, id).replace(/(:appId)/i, appId);
}

export function constructUrlWithNotEligibleReason(path: string, reason: NotEligibleReason): string {
  return `${path}?reason=${reason}`;
}

