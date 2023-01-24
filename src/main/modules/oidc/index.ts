import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AppRequest} from '../../common/models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';
import {
  ASSIGN_CLAIM_URL,
  CALLBACK_URL,
  DASHBOARD_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  UNAUTHORISED_URL,
} from '../../routes/urls';

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
      if (typeof req.query.code === 'string') {
        req.session.user = app.locals.user = await getUserDetails(redirectUri, req.query.code);
        if(req.session.assignClaimId){
          return res.redirect(ASSIGN_CLAIM_URL);
        }
        if (req.session.user?.roles?.includes(citizenRole)) {
          return  res.redirect(DASHBOARD_URL);
        }
        return res.redirect(UNAUTHORISED_URL);
      } else {
        res.redirect(DASHBOARD_URL);
      }
    });

    app.get(SIGN_OUT_URL, (req: AppRequest, res: Response) => {
      const params = new URLSearchParams({
        'id_token_hint': req.session.user?.accessToken,
        'post_logout_redirect_uri': applicationUrl,
      });

      req.session = app.locals.user = undefined;
      res.redirect(idamSignOutUrl + '?' + params.toString());
    });

    app.get('/', (_req: AppRequest, res: Response) => {
      res.redirect(DASHBOARD_URL);
    });

    app.use((req: Request, res: Response, next:NextFunction) => {
      const appReq: AppRequest = <AppRequest> req;
      if (appReq.session.user) {
        if (appReq.session?.user?.roles?.includes(citizenRole)) {
          return next();
        }
        return res.redirect(DASHBOARD_URL);
      }
      if(req.originalUrl.startsWith(ASSIGN_CLAIM_URL)) {
        appReq.session.assignClaimId = <string>req.query.id;
      }
      res.redirect(SIGN_IN_URL);
    });
  }
}
