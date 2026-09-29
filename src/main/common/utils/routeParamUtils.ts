import {Request} from 'express';

/** Express 5 route params may be `string | string[] | undefined`; use this for values passed into services or URL builders. */
export type RouteParam = string | string[] | undefined;

const UNUSABLE_SENTINELS = new Set(['undefined', 'null']);

/** Collapses array params to the first segment and maps missing values to `''`. */
export const normalizeRouteParam = (param: RouteParam): string => {
  if (Array.isArray(param)) {
    return param[0] ?? '';
  }
  return param ?? '';
};

/** Reads `req.params[key]` with the same normalization as {@link normalizeRouteParam}. */
export const getRouteParam = (req: Request, key: string): string => {
  return normalizeRouteParam(req.params?.[key]);
};

/**
 * True when the value can be interpolated into a path without becoming the
 * literal string "undefined" / "null" or an empty segment.
 */
export const isUsablePathSegment = (value?: string | string[] | null): boolean => {
  if (value == null) {
    return false;
  }
  const segment = Array.isArray(value) ? value[0] : value;
  if (segment == null) {
    return false;
  }
  const trimmed = segment.trim();
  return trimmed.length > 0 && !UNUSABLE_SENTINELS.has(trimmed.toLowerCase());
};

export class MissingPathSegmentError extends Error {
  constructor(public readonly segmentName: string) {
    super(`${segmentName} is missing`);
    this.name = 'MissingPathSegmentError';
  }
}

export class MissingPaymentReferenceError extends MissingPathSegmentError {
  constructor() {
    super('paymentReference');
    this.name = 'MissingPaymentReferenceError';
  }
}

/** Returns a trimmed path segment, or throws if it is missing or a JS sentinel. */
export const requirePathSegment = (value: RouteParam | null, name: string): string => {
  if (!isUsablePathSegment(value)) {
    if (name === 'paymentReference') {
      throw new MissingPaymentReferenceError();
    }
    throw new MissingPathSegmentError(name);
  }
  return normalizeRouteParam(value ?? undefined).trim();
};
