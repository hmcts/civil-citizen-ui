import express, {Application} from 'express';
import {AxiosError} from 'axios';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('errorHandler');
import {HTTPError} from '../../HttpError';
import config from 'config';

const env = process.env.NODE_ENV || 'development';
export class ErrorHandler {
  public enableFor(app: Application): void {
    // returning "not found" page for requests with paths not resolved by the router
    app.use((req, res) => {
      res.status(404);
      res.render('not-found');
    });

    // error handler
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const errorMessage = err.message || 'Internal Server Error';
      logger.error(`${err.stack || errorMessage}`);

      if ((err as AxiosError)?.response?.status === 401) {
        const loginUrl: string = config.get('services.idam.authorizationURL');
        const clientId: string = config.get('services.idam.clientID');
        const redirectUri: string = config.get('services.idam.callbackURL');
        const scope: string = config.get('services.idam.scope');
        const idamUrlLogin: string = loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri) + scope;
        return res.redirect(idamUrlLogin);
      }
      // set locals, only providing error in development
      res.locals.message = errorMessage;
      res.locals.error = env === 'development' ? err : {};
      res.status((err as HTTPError)?.status || 500);
      res.render('error', {error: res.locals.error});
    });
  }
}
