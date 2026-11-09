import express, {Application} from 'express';
import {isAxiosError} from 'axios';
import config from 'config';
const {Logger} = require('@hmcts/nodejs-logging');
const appInsights = require('applicationinsights');
const logger = Logger.getLogger('errorHandler');
import {HTTPError} from '../../HttpError';
import {CallbackError} from 'client/common/error/callbackError';
import {AppRequest} from 'models/AppRequest';
import {SIGN_IN_URL} from 'routes/urls';

const env = process.env.NODE_ENV || 'development';

/**
 * The view model for the error template, which renders `error.message` and nothing else.
 *
 * Passing the Error itself put its stack in the response view model, which Sonar reports as
 * stacktrace disclosure. The old `env === 'development'` guard also fails open: NODE_ENV
 * defaults to 'development' above, so an environment that does not set it would have exposed
 * the stack to the template. Only the message crosses the boundary now.
 */
const errorViewModel = (message: string): {message?: string} =>
  env === 'development' ? {message} : {};

const REAUTH_ON_401_WINDOW_MS = 5 * 60 * 1000;

// DTSCCI-6600: civil-service returns 401 when IDAM no longer accepts the session's access token
// (revoked or ended session). Retrying with the same token cannot succeed, so send the user back
// through sign-in instead of rendering the error page on every request.
const isCivilServiceUnauthorized = (err: Error): boolean =>
  isAxiosError(err)
  && err.response?.status === 401
  && err.config?.baseURL === config.get<string>('services.civilService.url');

const reauthenticate = (req: AppRequest, res: express.Response, next: express.NextFunction): boolean => {
  const reauthOn401At = req.session.reauthOn401At;
  if (reauthOn401At && Date.now() - reauthOn401At < REAUTH_ON_401_WINDOW_MS) {
    // A freshly issued token was rejected too, so another sign-in would loop.
    return false;
  }
  logger.warn(`Civil-service returned 401 for user ${req.session.user.id}; re-authenticating`);
  delete req.session.user;
  req.session.reauthOn401At = Date.now();
  req.session.save((saveErr) => saveErr ? next(saveErr) : res.redirect(SIGN_IN_URL));
  return true;
};
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
      const appReq = req as AppRequest;
      if (res.headersSent) {
        // Part of a response (e.g. a streamed document) has already gone out, so no error page or
        // redirect can be sent. Close the connection so the client does not treat the body as complete.
        logger.error(`Error after response headers were sent for ${req.method} ${req.originalUrl}: ${err.stack || errorMessage}`);
        res.destroy();
        return;
      }
      if (isCivilServiceUnauthorized(err) && appReq.session?.user && reauthenticate(appReq, res, _next)) {
        return;
      }

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
          error: errorViewModel(errorMessage),
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
        // Telemetry export must not prevent the original error response.
        void appInsightsClient?.flush()?.catch((): undefined => undefined);
      }

      // set locals, only providing error in development
      res.locals.message = errorMessage;
      res.locals.error = errorViewModel(errorMessage);
      res.status(status);
      res.render('error', {error: res.locals.error});
    });
  }
}
