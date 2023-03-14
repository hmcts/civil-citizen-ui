import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AppRequest} from '../../common/models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';
import {
  ASSIGN_CLAIM_URL, BASE_FIRST_CONTACT_URL,
  CALLBACK_URL,
  DASHBOARD_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  UNAUTHORISED_URL,
} from '../../routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('taskListController');

const requestIsForAssigningClaimForDefendant = (req: Request): boolean => {
  return req.originalUrl.startsWith(ASSIGN_CLAIM_URL) && req.query?.id !== undefined;
};

const requestIsForPinAndPost = (req: Request): boolean => {
  return req.originalUrl.startsWith(BASE_FIRST_CONTACT_URL);
};

const buildAssignClaimUrlWithId = (req: AppRequest, app: Application) : string => {
  const claimId = app.locals.assignClaimId;
  app.locals.assignClaimId = undefined;
  return `${ASSIGN_CLAIM_URL}?id=${claimId}`;
};

export class OidcMiddleware {
  public enableFor(app: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const clientId: string = config.get('services.idam.clientID');
    const redirectUri: string = config.get('services.idam.callbackURL');
    const citizenRole: string = config.get('services.idam.citizenRole');
    const scope: string = config.get('services.idam.scope');
    const idamUrlLogin: string = loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri) + scope;
    const idamSignOutUrl: string = config.get('services.idam.terminateSessionURL');
    const applicationUrl: string = config.get('services.idam.signOutCallBackURL');

    app.get(SIGN_IN_URL, (_req: AppRequest, res: Response) => {
      res.redirect(idamUrlLogin);
    });

    app.get(CALLBACK_URL, async (req: AppRequest, res: Response) => {
      logger.error('index.ts callback - req.query.code=' + req?.query?.code);
      if (typeof req.query.code === 'string') {
        logger.error('index.ts callback - getting user details');
        req.session.user = app.locals.user = await getUserDetails(redirectUri, req.query.code);
        if (app.locals.assignClaimId) {
          logger.error('index.ts callback - assigning claim id');
          const assignClaimUrlWithClaimId = buildAssignClaimUrlWithId(req, app);
          return res.redirect(assignClaimUrlWithClaimId);
        }
        if (app.locals.user?.roles?.includes(citizenRole)) {
          logger.error('index.ts callback - redirect to dashboard');
          return res.redirect(DASHBOARD_URL);
        }
        logger.error('index.ts callback - unauthorised url');
        return res.redirect(UNAUTHORISED_URL);
      } else {
        logger.error('index.ts callback - else (req.query.code is not a string) - redirect to dashboard');
        res.redirect(DASHBOARD_URL);
      }
    });

    app.get(SIGN_OUT_URL, (req: AppRequest, res: Response) => {
      const params = new URLSearchParams({
        'id_token_hint': app.locals.user?.accessToken,
        'post_logout_redirect_uri': applicationUrl,
      });

      req.session = app.locals.user = undefined;
      res.redirect(idamSignOutUrl + '?' + params.toString());
    });

    app.get('/', (_req: AppRequest, res: Response) => {
      res.redirect(DASHBOARD_URL);
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      const appReq: AppRequest = <AppRequest>req;
      logger.error('index.ts app.use start: appReq.session.user=' + appReq.session?.user
        + ' app.locals.user=' + app.locals.user + ' appReq.session=' + appReq.session
        + ' appReq.session.id=' + appReq.session?.id);
      if (app.locals.user) {
        if (app.locals.user.roles?.includes(citizenRole)) {
          logger.error('index.ts app.use return 1 - next');
          return next();
        }
        logger.error('index.ts app.use return 2 - dashboard');
        return res.redirect(DASHBOARD_URL);
      }
      if (requestIsForPinAndPost(req)) {
        logger.error('index.ts app.use return 3 - next (pin and post)');
        return next();
      }
      if (requestIsForAssigningClaimForDefendant(req)) {
        logger.error('index.ts app.use debug 4 - setting claim id');
        app.locals.assignClaimId = <string>req.query.id;
      }
      logger.error('index.ts app.use end - redirecting to sign in url');
      return res.redirect(SIGN_IN_URL);
    });
  }
}

