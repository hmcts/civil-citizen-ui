import { AppRequest } from 'common/models/AppRequest';
import { Request } from 'express';

export const queryParamNumber = (req: Request | AppRequest, paramName: string) =>
  toNumberIfPresent(req.query[paramName] as string);

const toNumberIfPresent = (str: string | undefined): number | undefined =>
  str ? (+str) : undefined;
