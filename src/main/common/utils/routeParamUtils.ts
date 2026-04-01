import {Request} from 'express';

export type RouteParam = string | string[] | undefined;

export const normalizeRouteParam = (param: RouteParam): string => {
  if (Array.isArray(param)) {
    return param[0] ?? '';
  }
  return param ?? '';
};

export const getRouteParam = (req: Request, key: string): string => {
  return normalizeRouteParam(req.params?.[key]);
};

