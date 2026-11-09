import {Application, NextFunction, RequestHandler, Response} from 'express';
import express from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {
  ASSIGN_CLAIM_URL,
  BASE_ELIGIBILITY_URL,
  CALLBACK_URL,
  CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  CLAIMANT_TASK_LIST_URL,
  DASHBOARD_URL,
  FIRST_CONTACT_SIGNPOSTING_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  TESTING_SUPPORT_URL,
  UNAUTHORISED_URL,
} from 'routes/urls';
import {getOidcResponse, getSessionIssueTime, getUserDetails} from 'app/auth/user/oidc';
import {
  deletePaymentConfirmationUrl,
  getPaymentConfirmationUrl,
  getUserId,
  saveOriginalPaymentConfirmationUrl,
} from 'modules/draft-store/paymentSessionStoreService';
import {getClaimId, getFeeTypeFromUrl, isTestingSupportDraftUrl, OidcMiddleware} from 'modules/oidc';
import {createMockResponse} from '../../../utils/getRouteHandler';

jest.mock('app/auth/user/oidc');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isHmctsAccessMigrationEnabled: jest.fn().mockResolvedValue(false),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  getPaymentConfirmationUrl: jest.fn(),
  saveOriginalPaymentConfirmationUrl: jest.fn(),
  deletePaymentConfirmationUrl: jest.fn(),
  getUserId: jest.fn(),
}));

const mockGetOidcResponse = getOidcResponse as jest.Mock;
const mockGetUserDetails = getUserDetails as jest.Mock;
const mockGetSessionIssueTime = getSessionIssueTime as jest.Mock;
const mockGetPaymentConfirmationUrl = getPaymentConfirmationUrl as jest.Mock;
const mockSaveOriginalPaymentConfirmationUrl = saveOriginalPaymentConfirmationUrl as jest.Mock;
const mockDeletePaymentConfirmationUrl = deletePaymentConfirmationUrl as jest.Mock;
const mockGetUserId = getUserId as jest.Mock;

const citizenRole: string = config.get('services.idam.citizenRole');
const paymentClaimId = '1729760747011812';
const paymentUrl = CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID
  .replace(':id', paymentClaimId)
  .replace(':uniqueId', 'abc-unique-456');

type SessionDouble = {
  user?: {id: string; roles?: string[]; idToken?: string};
  issuedAt?: number;
  assignClaimURL?: string;
  claimIssueTasklist?: boolean;
  paymentConfirmationContext?: {claimId: string; feeType: FeeType};
  save: (callback: (err?: Error) => void) => void;
  destroy: (callback: () => void) => void;
};

type RouteLayer = {
  route?: {methods?: Record<string, boolean>; path?: string; stack: Array<{handle: RequestHandler}>};
  handle: RequestHandler;
};

const routerStack = (application: Application): RouteLayer[] =>
  (application as unknown as {router: {stack: RouteLayer[]}}).router.stack;

const authApp = express();
new OidcMiddleware().enableFor(authApp);
const stack = routerStack(authApp);

const routeHandler = (method: 'get', path: string): RequestHandler => {
  const layer = stack.find(candidate => candidate.route?.methods?.[method] && candidate.route.path === path);
  if (!layer?.route) {
    throw new Error(`No ${method.toUpperCase()} handler for ${path}`);
  }
  const handlers = layer.route.stack;
  return handlers[handlers.length - 1].handle;
};

const authGate = stack.filter(layer => !layer.route).pop()?.handle as RequestHandler;

const userDetails = {
  accessToken: 'token',
  idToken: 'id-token',
  email: 'dfkdh',
  id: 'jfkdljfd',
  familyName: 'masslover',
  givenName: 'tatiana',
  roles: [citizenRole],
};

const createSession = (): SessionDouble => ({
  save: (callback) => callback(),
  destroy: (callback) => callback(),
});

const invoke = async (handler: RequestHandler, req: object) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  await handler(req as unknown as AppRequest, res as unknown as Response, next);
  return {res, next};
};

describe('OIDC middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userDetails.roles = [citizenRole];
    mockGetOidcResponse.mockResolvedValue({id_token: '1', access_token: ''});
    mockGetUserDetails.mockReturnValue(userDetails);
    mockGetSessionIssueTime.mockReturnValue(1234);
    mockGetUserId.mockResolvedValue('123456789');
    mockSaveOriginalPaymentConfirmationUrl.mockResolvedValue(undefined);
    mockDeletePaymentConfirmationUrl.mockResolvedValue(undefined);
    mockGetPaymentConfirmationUrl.mockResolvedValue(undefined);
  });

  describe('route handlers', () => {
    it('redirects sign-in to the IDAM authorise URL', async () => {
      const {res} = await invoke(routeHandler('get', SIGN_IN_URL), {});

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('client_id='));
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('response_type=code'));
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('callback'));
    });

    it('redirects sign-out to the IDAM end-session URL', async () => {
      const session = createSession();
      session.user = {id: userDetails.id, idToken: 'id-token', roles: [citizenRole]};

      const {res} = await invoke(routeHandler('get', SIGN_OUT_URL), {session});

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(config.get<string>('services.idam.terminateSessionURL')));
    });

    it('redirects the root path to the dashboard', async () => {
      const {res} = await invoke(routeHandler('get', '/'), {});

      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
    });

    it('redirects the callback to the dashboard when the code is missing', async () => {
      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {query: {}, session: createSession()});

      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
      expect(mockGetOidcResponse).not.toHaveBeenCalled();
    });

    it('redirects a citizen back to the assign-claim URL stored on the session', async () => {
      const session = createSession();
      session.assignClaimURL = ASSIGN_CLAIM_URL;

      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {query: {code: 'string'}, session});

      expect(res.redirect).toHaveBeenCalledWith(ASSIGN_CLAIM_URL);
      expect(session.assignClaimURL).toBeUndefined();
    });

    it('redirects a citizen back to the claim task list when that flag is set', async () => {
      const session = createSession();
      session.claimIssueTasklist = true;

      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {query: {code: 'string'}, session});

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
      expect(session.claimIssueTasklist).toBeUndefined();
    });

    it('redirects a citizen to the dashboard after login', async () => {
      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {
        query: {code: 'string'},
        session: createSession(),
        originalUrl: CALLBACK_URL,
      });

      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
    });

    it('redirects to unauthorised when the user has no citizen role', async () => {
      userDetails.roles = [];

      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {
        query: {code: 'string'},
        session: createSession(),
        originalUrl: CALLBACK_URL,
      });

      expect(res.redirect).toHaveBeenCalledWith(UNAUTHORISED_URL);
    });

    it('redirects back to the stored payment confirmation URL after login', async () => {
      mockGetPaymentConfirmationUrl.mockResolvedValue(paymentUrl);
      const session = createSession();

      const {res} = await invoke(routeHandler('get', CALLBACK_URL), {
        query: {code: 'string'},
        session,
        originalUrl: CALLBACK_URL,
      });

      expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
      expect(mockDeletePaymentConfirmationUrl).toHaveBeenCalled();
    });

    it('throws when the IDAM token request fails', async () => {
      mockGetOidcResponse.mockRejectedValue(new Error('IDAM error'));

      await expect(invoke(routeHandler('get', CALLBACK_URL), {
        query: {code: 'string'},
        session: createSession(),
      })).rejects.toThrow('IDAM error');
    });

    it('throws when the payment confirmation lookup fails', async () => {
      mockGetPaymentConfirmationUrl.mockRejectedValue(new Error('error in getting the value'));

      await expect(invoke(routeHandler('get', CALLBACK_URL), {
        query: {code: 'string'},
        session: createSession(),
        originalUrl: CALLBACK_URL,
      })).rejects.toThrow('error in getting the value');
    });
  });

  describe('authentication gate', () => {
    it('allows a signed-in citizen through', async () => {
      const {res, next} = await invoke(authGate, {
        originalUrl: DASHBOARD_URL,
        session: {...createSession(), user: {id: userDetails.id, roles: [citizenRole]}},
      });

      expect(next).toHaveBeenCalledWith();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('allows first contact and eligibility pages through', async () => {
      const firstContact = await invoke(authGate, {
        originalUrl: FIRST_CONTACT_SIGNPOSTING_URL,
        session: createSession(),
      });
      const eligibility = await invoke(authGate, {
        originalUrl: `${BASE_ELIGIBILITY_URL}/claim-value`,
        session: createSession(),
      });

      expect(firstContact.next).toHaveBeenCalledWith();
      expect(eligibility.next).toHaveBeenCalledWith();
      expect(firstContact.res.redirect).not.toHaveBeenCalled();
    });

    it('stores the assign-claim URL and redirects an anonymous user to sign in', async () => {
      const session = createSession();

      const {res} = await invoke(authGate, {originalUrl: ASSIGN_CLAIM_URL, session});

      expect(session.assignClaimURL).toBe(ASSIGN_CLAIM_URL);
      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('stores the task-list flag and redirects an anonymous user to sign in', async () => {
      const session = createSession();

      const {res} = await invoke(authGate, {originalUrl: CLAIMANT_TASK_LIST_URL, session});

      expect(session.claimIssueTasklist).toBe(true);
      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('saves the payment confirmation URL before redirecting to sign in', async () => {
      const {res} = await invoke(authGate, {originalUrl: paymentUrl, session: createSession()});

      expect(mockGetUserId).toHaveBeenCalledWith(paymentClaimId, FeeType.CLAIMISSUED);
      expect(mockSaveOriginalPaymentConfirmationUrl).toHaveBeenCalledWith(
        paymentClaimId,
        FeeType.CLAIMISSUED,
        '123456789',
        paymentUrl,
      );
      expect(res.redirect).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('throws when saving the payment confirmation URL fails', async () => {
      mockSaveOriginalPaymentConfirmationUrl.mockRejectedValue(new Error('error in getting the value'));

      await expect(invoke(authGate, {
        originalUrl: paymentUrl,
        session: createSession(),
      })).rejects.toThrow('error in getting the value');
    });
  });

  describe('URL helpers', () => {
    it('reads a 16 digit claim id and the fee type from a confirmation URL', () => {
      expect(getClaimId(paymentUrl)).toBe(paymentClaimId);
      expect(getClaimId('/claim-issued-payment-confirmation/123')).toBeUndefined();
      expect(getFeeTypeFromUrl('/hearing-payment-confirmation/1')).toBe(FeeType.HEARING);
      expect(getFeeTypeFromUrl(paymentUrl)).toBe(FeeType.CLAIMISSUED);
      expect(getFeeTypeFromUrl('/general-application/payment-confirmation/1')).toBe(FeeType.GENERALAPPLICATION);
      expect(getFeeTypeFromUrl('/dashboard')).toBeUndefined();
      expect(isTestingSupportDraftUrl(`${TESTING_SUPPORT_URL}/draft`)).toBe(true);
      expect(isTestingSupportDraftUrl(DASHBOARD_URL)).toBe(false);
    });
  });
});

describe('OidcMiddleware registration', () => {
  it('registers the middleware on the application passed to enableFor', () => {
    const application = express();
    new OidcMiddleware().enableFor(application);

    const registered = routerStack(application);
    expect(registered.some(layer => layer.route?.path === SIGN_IN_URL)).toBe(true);
    expect(registered.some(layer => !layer.route)).toBe(true);
  });
});
