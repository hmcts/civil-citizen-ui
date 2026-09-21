import express, {Application} from 'express';
const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('errorHandler');
import {HTTPError} from '../../HttpError';
import {CallbackError} from 'client/common/error/callbackError';

const env = process.env.NODE_ENV || 'development';
export class ErrorHandler {
  public enableFor(app: Application): void {
    // returning "not found" page for requests with paths not resolved by the router
    app.use((req, res) => {
      res.status(404);
      res.render('not-found');
    });

    // error handler
    app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const errorMessage = err.message || 'Internal Server Error';
      const status = (err as HTTPError)?.status || 500;
      logger.error(`${err.stack || errorMessage}`);

      // DTSCCI-5282: a rejected citizen-event callback (422) carries user-actionable
      // messages from CCD. Render those instead of the generic "Something went wrong" page.
      // Narrow with instanceof (not just a duck-typed callbackErrors check) so an unrelated
      // 5xx that happens to carry a callbackErrors property isn't misreported as a 422 and
      // skipped for App Insights tracking below.
      if (err instanceof CallbackError && err.callbackErrors?.length) {
        res.status(err.status || 422);
        return res.render('error', {
          callbackErrors: err.callbackErrors,
          callbackWarnings: err.callbackWarnings,
          error: env === 'development' ? err : {},
        });
      }

      if (status >= 500) {
        const appInsightsClient = appInsights.defaultClient;
        appInsightsClient?.trackException({
          exception: err,
          properties: {
            url: req.originalUrl,
            method: req.method,
            status: status.toString(),
          },
        });
        appInsightsClient?.flush({
          isAppCrashing: false,
          callback: (): void => undefined,
        });
      }

      // set locals, only providing error in development
      res.locals.message = errorMessage;
      res.locals.error = env === 'development' ? err : {};
      res.status(status);
      res.render('error', {error: res.locals.error});
    });
  }
}
