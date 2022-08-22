import {NotEligibleReason} from '../../common/form/models/eligibility/NotEligibleReason';

export function constructResponseUrlWithIdParams(id: string, path: string): string{
  return path.replace(/(:id)/i, id);
}

export function constructUrlWithNotEligibleReson(path: string, reason: NotEligibleReason): string {
  return `${path}?reason=${reason}`;
}

