import {Application, NextFunction,Response} from 'express';
import config from 'config';
import {AppRequest} from '../../common/models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';
import {SIGN_IN_URL, SIGN_OUT_URL, CALLBACK_URL, DASHBOARD_URL, UNAUTHORISED_URL} from '../../routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('auth');

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
    const idamSignOutUrl: string = config.get('services.idam.terminateSessionURL');
    const applicationUrl: string = config.get('services.idam.signOutCallBackURL');

    app.get(SIGN_IN_URL, (_req: AppRequest, res: Response) => {
      res.redirect(idamUrlLogin);
    });

    app.get(CALLBACK_URL, async (req: AppRequest, res: Response) => {
      logger.info('callback url');
      if (typeof req.query.code === 'string') {
        req.session.user = app.locals.user = await getUserDetails(redirectUri, req.query.code);
        if (req.session.user?.roles?.includes(citizenRole)) {
          return res.redirect(DASHBOARD_URL);
        }
        logger.info('missing citizen role');
        return res.redirect(UNAUTHORISED_URL);
      } else {
        logger.info('missing query code');
        res.redirect(DASHBOARD_URL);
      }
    });

    app.get(SIGN_OUT_URL, (req: AppRequest, res:Response) => {
      const params = new URLSearchParams({
        'id_token_hint': req.session.user?.idToken,
        'post_logout_redirect_uri': applicationUrl,
      });

      req.session = app.locals.user = undefined;
      res.redirect(idamSignOutUrl + '?' + params.toString());
    });

    app.get('/', (_req: AppRequest, res: Response) => {
      res.redirect(DASHBOARD_URL);
    });

    app.use((req: AppRequest, res: Response, next: NextFunction) => {
      if (req.session.user) {
        if (req.session?.user?.roles?.includes(citizenRole)) {
          return next();
        }
        logger.info('user missing citizen role');
        return res.redirect(DASHBOARD_URL);
      }
      logger.info('session user not set');
      res.redirect(SIGN_IN_URL);
    });
  }
}
