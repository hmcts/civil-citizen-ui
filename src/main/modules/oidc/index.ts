import {Application, NextFunction,Response} from 'express';
import config from 'config';
import {AppRequest} from '../../common/models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';

import {SIGN_IN_URL, SIGN_OUT_URL, CALLBACK_URL, DASHBOARD_URL, UNAUTHORISED_URL} from '../../routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('oidcIndex');
require( 'trace-unhandled/register' );

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  public enableFor(app: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const clientId: string = config.get('services.idam.clientID');
    const redirectUri: string = config.get('services.idam.callbackURL');
    const citizenRole: string = config.get('services.idam.citizenRole');
    const scope: string = config.get('services.idam.scope');
    const idamUrlLogin: string = loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri)+scope;

    app.get(SIGN_IN_URL, (req: AppRequest, res: Response) => {
      res.redirect(idamUrlLogin);
    });

    app.get(CALLBACK_URL, async (req: AppRequest, res: Response) => {
      try {
        if (typeof req.query.code === 'string') {
          req.session.user = await getUserDetails(redirectUri, req.query.code);
          if (req.session.user?.roles?.includes(citizenRole)) {
            return res.redirect(DASHBOARD_URL);
          }
          return res.redirect(UNAUTHORISED_URL);
        } else {
          res.redirect(DASHBOARD_URL);
        }
      } catch (error) {
        logger.error(`${error.stack || error}`);
      }
    });

    app.get(SIGN_OUT_URL, (req: AppRequest, res: Response) => {
      req.session.user = undefined;
      res.redirect(SIGN_IN_URL);
    });

    app.get('/', (req: AppRequest, res: Response) => {
      res.redirect(DASHBOARD_URL);
    });

    app.use((req: AppRequest, res: Response, next: NextFunction) => {
      if (req.session.user) {
        if (req.session?.user?.roles?.includes(citizenRole)) {
          return next();
        }
        return res.redirect(DASHBOARD_URL);
      }
      res.redirect(SIGN_IN_URL);
    });
  }
}
