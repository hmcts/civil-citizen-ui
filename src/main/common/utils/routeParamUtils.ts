import {Request} from 'express';

/** Express 5 route params may be `string | string[] | undefined`; use this for values passed into services or URL builders. */
export type RouteParam = string | string[] | undefined;

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

