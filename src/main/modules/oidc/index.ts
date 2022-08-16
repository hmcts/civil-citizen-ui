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
      if (typeof req.query.code === 'string') {
        req.session.user = await getUserDetails(redirectUri, req.query.code);
        app.locals.user = await getUserDetails(redirectUri, req.query.code);
        if (req.session.user?.roles?.includes(citizenRole)) {
          return res.redirect(DASHBOARD_URL);
        }
        return res.redirect(UNAUTHORISED_URL);
      } else {
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
      logger.info('middleware');
      if (req.session.user) {
        logger.info('have session user', req.session.user);
        logger.info('user roles', req.session?.user?.roles?.includes(citizenRole));
        if (req.session?.user?.roles?.includes(citizenRole)) {
          logger.info('includes citizen role');
          return next();
        }
        return res.redirect(DASHBOARD_URL);
      }
      res.redirect(SIGN_IN_URL);
    });
  }
}
