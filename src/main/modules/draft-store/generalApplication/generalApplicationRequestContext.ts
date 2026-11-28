import {AsyncLocalStorage} from 'node:async_hooks';
import {NextFunction, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';

export const generalApplicationRequestContext = new AsyncLocalStorage<AppRequest>();

export const bindGeneralApplicationRequest = (req: AppRequest, _res: Response, next: NextFunction): void => {
  generalApplicationRequestContext.run(req, () => next());
};
