import express, {Application} from 'express';
const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('errorHandler');
import {HTTPError} from '../../HttpError';

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
      appInsights.defaultClient?.trackTrace({
        message: 'TEMP_ERROR_MIDDLEWARE_REACHED',
        properties: {
          url: req.originalUrl,
          method: req.method,
          status: status.toString(),
          errorMessage,
        },
      });
      if (status >= 500) {
        appInsights.defaultClient?.trackException({
          exception: err,
          properties: {
            url: req.originalUrl,
            method: req.method,
            status: status.toString(),
          },
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
