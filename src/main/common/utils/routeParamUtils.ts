export type RouteParam = string | string[] | undefined;

export const normalizeRouteParam = (param: RouteParam): string => {
  if (Array.isArray(param)) {
    return param[0] ?? '';
  }
  return param ?? '';
};

