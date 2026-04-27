import {NotEligibleReason} from '../../common/form/models/eligibility/NotEligibleReason';
import {normalizeRouteParam, RouteParam} from 'common/utils/routeParamUtils';

export function constructResponseUrlWithIdParams(id: RouteParam, path: string): string{
  return path.replace(/(:id)/i, normalizeRouteParam(id));
}

export function constructResponseUrlWithIdAndAppIdParams(id: RouteParam, appId: RouteParam, path: string): string {
  return path.replace(/(:id)/i, normalizeRouteParam(id)).replace(/(:appId)/i, normalizeRouteParam(appId));
}

export function constructDocumentUrlWithIdParamsAndDocumentId(id: RouteParam, documentId: RouteParam, path: string): string{
  return path.replace(/(:id)/i, normalizeRouteParam(id)).replace(/(:documentId)/i, normalizeRouteParam(documentId));
}

export function constructUrlWithNotEligibleReason(path: string, reason: NotEligibleReason): string {
  return `${path}?reason=${reason}`;
}

export function constructUrlWithIndex(path: string, index: number): string {
  return `${path}?index=${index}`;
}

