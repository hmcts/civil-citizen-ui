import express from 'express';

import { Paths } from 'paid-in-full/paths';
import { ErrorHandling } from 'shared/errorHandling';

/* tslint:disable:no-default-export */
export default express.Router()
  .get(Paths.confirmationPage.uri,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.render(Paths.confirmationPage.associatedView, {});
    }));
