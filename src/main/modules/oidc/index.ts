import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {getOidcResponse, getSessionIssueTime, getUserDetails} from '../../app/auth/user/oidc';
import {
  ASSIGN_CLAIM_URL,
  BASE_ELIGIBILITY_URL,
  BASE_FIRST_CONTACT_URL,
  CALLBACK_URL,
  CLAIMANT_TASK_LIST_URL,
  DASHBOARD_URL,
  MAKE_CLAIM,
  TESTING_SUPPORT_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  UNAUTHORISED_URL,
  ACCESSIBILITY_STATEMENT_URL,
  CONTACT_US_URL,
  TERMS_AND_CONDITIONS_URL,
  PRIVACY_POLICY_URL,
} from 'routes/urls';

const requestIsForAssigningClaimForDefendant = (req: Request): boolean => {
  return req.originalUrl.startsWith(ASSIGN_CLAIM_URL);
};

const isPaymentConfirmationUrl = (req: Request): boolean => {
  const paymentUrls = ['/hearing-payment-confirmation', '/claim-issued-payment-confirmation'];
  return paymentUrls.some(url => req.originalUrl.startsWith(url));
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

const isAccessibilityStatementPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(ACCESSIBILITY_STATEMENT_URL);
};

const isContactUsPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(CONTACT_US_URL);
};

const isTermAndConditionsPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(TERMS_AND_CONDITIONS_URL);
};

const isPrivacyPolicyPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(PRIVACY_POLICY_URL);
};

const isMakeClaimPage = (requestUrl: string): boolean => {
  return requestUrl.startsWith(MAKE_CLAIM);
};

const buildAssignClaimUrlWithId = (req: AppRequest, app: Application): string => {
  app.locals.assignClaimURL = undefined;
  req.session.assignClaimURL = undefined;
  return `${ASSIGN_CLAIM_URL}`;
};

export const isTestingSupportDraftUrl = (requestUrl: string): boolean => {
  return requestUrl.startsWith(TESTING_SUPPORT_URL);
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

        const responseData = await getOidcResponse(redirectUri, req.query.code);
        req.session.user = app.locals.user = getUserDetails(responseData);
        req.session.issuedAt = getSessionIssueTime(responseData);

        if (app.locals.assignClaimURL || req.session.assignClaimURL) {
          const assignClaimUrlWithClaimId = buildAssignClaimUrlWithId(req, app);
          return res.redirect(assignClaimUrlWithClaimId);
        }
        if (app.locals.claimIssueTasklist || req.session.claimIssueTasklist) {
          req.session.claimIssueTasklist = undefined;
          app.locals.claimIssueTasklist = undefined;
          return res.redirect(CLAIMANT_TASK_LIST_URL);
        }
        if (app.locals.paymentConfirmationUrl) {
          const paymentConfirmationUrl = app.locals.paymentConfirmationUrl;
          app.locals.paymentConfirmationUrl = '';
          return res.redirect(paymentConfirmationUrl);
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
      if (
        requestIsForPinAndPost(req) ||
        requestIsForDownloadPdf(req) ||
        isEligibilityPage(req.originalUrl) ||
        isMakeClaimPage(req.originalUrl) ||
        isTestingSupportDraftUrl(req.originalUrl) ||
        isAccessibilityStatementPage(req.originalUrl) ||
        isContactUsPage(req.originalUrl) ||
        isTermAndConditionsPage(req.originalUrl) ||
        isPrivacyPolicyPage(req.originalUrl)
      ) {
        return next();
      }
      if (requestIsForAssigningClaimForDefendant(req) ) {
        app.locals.assignClaimURL = appReq.session.assignClaimURL = ASSIGN_CLAIM_URL;
      }
      if (requestIsForClaimIssueTaskList(req) ) {
        app.locals.claimIssueTasklist = appReq.session.claimIssueTasklist = true;
      }
      if (isPaymentConfirmationUrl(req)) {
        app.locals.paymentConfirmationUrl = req.originalUrl;
      }
      return res.redirect(SIGN_IN_URL);
    });
  }
}
