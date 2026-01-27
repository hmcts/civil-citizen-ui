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
  CONTACT_CNBC_URL,
  CONTACT_MEDIATION_URL,
} from 'routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('IDAMlogs');

const requestIsForAssigningClaimForDefendant = (req: Request): boolean => {
  return req.originalUrl.startsWith(ASSIGN_CLAIM_URL);
};

const isPaymentConfirmationUrl = (req: Request): boolean => {
  const paymentUrls = [
    '/hearing-payment-confirmation',
    '/claim-issued-payment-confirmation',
    '/general-application/payment-confirmation',
  ];
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

const isWebchatPage = (requestUrl: string): boolean => {
  return [CONTACT_CNBC_URL, CONTACT_MEDIATION_URL].some(url => requestUrl.startsWith(url));
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
      try {
        if (typeof req.query.code === 'string') {

          const responseData = await getOidcResponse(redirectUri, req.query.code);
          req.session.user = app.locals.user = getUserDetails(responseData);
          req.session.issuedAt = getSessionIssueTime(responseData);

          /* istanbul ignore next -- investigation logging for IDAM/session debugging */
          logger.info('IDAM investigation: tokens (masked)', { // NOSONAR
            access_token_suffix: responseData?.access_token ? `***${responseData.access_token.slice(-4)}` : undefined,
            id_token_suffix: responseData?.id_token ? `***${responseData.id_token.slice(-4)}` : undefined,
          });
          /* istanbul ignore next -- investigation logging for IDAM/session debugging */
          logger.info('IDAM investigation: user details from IDAM', { // NOSONAR
            id: req.session.user?.id,
            email: req.session.user?.email,
            givenName: req.session.user?.givenName,
            familyName: req.session.user?.familyName,
            roles: req.session.user?.roles,
          });
          /* istanbul ignore next -- investigation logging for Redis session key */
          logger.info('IDAM investigation: Redis/session', { // NOSONAR
            sessionId: (req as Request & { sessionID?: string }).sessionID,
            cookieName: 'citizen-ui-session',
          });

          logger.info('After login payment confirmation ', app.locals.paymentConfirmationUrl);
          if (app.locals.assignClaimURL || req.session.assignClaimURL) {
            const assignClaimUrlWithClaimId = buildAssignClaimUrlWithId(req, app);
            return res.redirect(assignClaimUrlWithClaimId);
          }
          if (app.locals.claimIssueTasklist || req.session.claimIssueTasklist) {
            req.session.claimIssueTasklist = undefined;
            app.locals.claimIssueTasklist = undefined;
            return res.redirect(CLAIMANT_TASK_LIST_URL);
          }

          logger.info('login user id ', req.session.user.id);
          const paymentConfirmationUrl = await getPaymentConfirmationUrl(req.session.user.id, app);
          logger.info('Payment conf url ', paymentConfirmationUrl);
          if (paymentConfirmationUrl) {
            await app.locals.draftStoreClient.del(req.session.user.id + 'userIdForPayment');
            return res.redirect(paymentConfirmationUrl);
          }
          if (req.session.user?.roles?.includes(citizenRole)) {
            return res.redirect(DASHBOARD_URL);
          }
          return res.redirect(UNAUTHORISED_URL);
        } else {
          res.redirect(DASHBOARD_URL);
        }
      } catch (err) {
        logger.info('Error in the callback of idam ', err);
        throw err;
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

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
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
          isPrivacyPolicyPage(req.originalUrl) ||
          isWebchatPage(req.originalUrl)
        ) {
          return next();
        }
        if (requestIsForAssigningClaimForDefendant(req)) {
          app.locals.assignClaimURL = appReq.session.assignClaimURL = ASSIGN_CLAIM_URL;
        }
        if (requestIsForClaimIssueTaskList(req)) {
          app.locals.claimIssueTasklist = appReq.session.claimIssueTasklist = true;
        }
        logger.info('redirecting url ', req.originalUrl);
        if (isPaymentConfirmationUrl(req)) {
          const claimId = getClaimId(req.originalUrl);
          logger.info('Condition satisfied for payment confirmation ', req.originalUrl);
          logger.info('Claim id ', claimId);
          if (!claimId) {
            logger.info('claim id does not exist from payment confirmation url ', claimId);
          } else {
            const userId = await getUserId(claimId, app);
            logger.info('User id ', userId);
            await saveOriginalPaymentConfirmationUrl(userId, req.originalUrl, app);
          }
        }
        return res.redirect(SIGN_IN_URL);
      } catch (err) {
        logger.info('Error in the middleware of while session check ', err);
        throw err;
      }
    });
  }
}

export const saveOriginalPaymentConfirmationUrl = async (userId: string, originalUrl: string, app: Application) => {
  await app.locals.draftStoreClient.set(userId + 'userIdForPayment', originalUrl);
};

export const getUserId = async (claimId: string, app: Application): Promise<string> => {
  return await app.locals.draftStoreClient.get(claimId + 'userIdForPayment');
};

export const getPaymentConfirmationUrl = async (userId: string, app: Application): Promise<string> => {
  return await app.locals.draftStoreClient.get(userId + 'userIdForPayment');
};

const getClaimId = (originalUrl: string) => {
  const regex = /\/(\d{16})\//;
  const match = originalUrl?.match(regex);
  if (match && match.length >=2 && match[1].length === 16) {
    return match[1];
  }
};
