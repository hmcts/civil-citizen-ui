import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';
import {
  ASSIGN_CLAIM_URL,
  BASE_ELIGIBILITY_URL,
  BASE_FIRST_CONTACT_URL,
  CALLBACK_URL,
  CLAIMANT_TASK_LIST_URL,
  DASHBOARD_URL,
  TESTING_SUPPORT_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  UNAUTHORISED_URL,
} from 'routes/urls';

const requestIsForAssigningClaimForDefendant = (req: Request): boolean => {
  return req.originalUrl.startsWith(ASSIGN_CLAIM_URL) && req.query?.id !== undefined;
};

const requestIsForClaimIssueTaskList = (req: Request): boolean => {
  return req.originalUrl.startsWith(CLAIMANT_TASK_LIST_URL);
};

const requestIsForPinAndPost = (req: Request): boolean => {
  return req.originalUrl.startsWith(BASE_FIRST_CONTACT_URL);
};

const requestIsForDownloadPdf = (req: Request): boolean => {
  return req.originalUrl.includes('/documents/');
};

const isEligibilityPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(BASE_ELIGIBILITY_URL);
};

const isTestingSupportDraftUrl = (requestUrl: string): boolean => {
  return requestUrl.startsWith(TESTING_SUPPORT_URL)
}

const buildAssignClaimUrlWithId = (req: AppRequest, app: Application) : string => {
  const claimId = req.session.assignClaimId;
  app.locals.assignClaimId = undefined;
  req.session.assignClaimId = undefined;
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
      if (typeof req.query.code === 'string') {
        req.session.user = app.locals.user = await getUserDetails(redirectUri, req.query.code);
        if (app.locals.assignClaimId || req.session.assignClaimId) {
          const assignClaimUrlWithClaimId = buildAssignClaimUrlWithId(req, app);
          return res.redirect(assignClaimUrlWithClaimId);
        }
        if (app.locals.claimIssueTasklist || req.session.claimIssueTasklist) {
          req.session.claimIssueTasklist = undefined;
          app.locals.claimIssueTasklist = undefined;
          return res.redirect(CLAIMANT_TASK_LIST_URL);
        }
        if (req.session.user?.roles?.includes(citizenRole)) {
          return res.redirect(DASHBOARD_URL);
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

      req.session.destroy(() => {
        req.session = app.locals.user = undefined;
        res.redirect(idamSignOutUrl + '?' + params.toString());
      });
    });

    app.get('/', (_req: AppRequest, res: Response) => {
      res.redirect(DASHBOARD_URL);
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      const appReq: AppRequest = <AppRequest>req;
      if (appReq.session?.user) {
        if (appReq.session.user.roles?.includes(citizenRole)) {
          return next();
        }
      }
      if (requestIsForPinAndPost(req) || requestIsForDownloadPdf(req) || isEligibilityPage(req.originalUrl) || isTestingSupportDraftUrl(req.originalUrl)) {
        return next();
      }
      if (requestIsForAssigningClaimForDefendant(req) ) {
        app.locals.assignClaimId = appReq.session.assignClaimId = <string>req.query.id;
      }
      if (requestIsForClaimIssueTaskList(req) ) {
        app.locals.claimIssueTasklist = appReq.session.claimIssueTasklist = true;
      }
      return res.redirect(SIGN_IN_URL);
    });
  }
}
