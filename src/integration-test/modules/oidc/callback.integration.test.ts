import express from 'express';
import session from 'express-session';
import request from 'supertest';
import config from 'config';
import {AxiosError, AxiosHeaders} from 'axios';
const {OidcMiddleware} = jest.requireActual('modules/oidc') as typeof import('modules/oidc');
import {AppRequest} from 'models/AppRequest';
import {getOidcResponse, getUserDetails, getSessionIssueTime} from 'app/auth/user/oidc';
import {ASSIGN_CLAIM_URL, CALLBACK_URL, DASHBOARD_URL, SIGN_IN_URL, UNAUTHORISED_URL} from 'routes/urls';

jest.mock('app/auth/user/oidc');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isHmctsAccessMigrationEnabled: jest.fn().mockResolvedValue(false),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  getPaymentConfirmationUrl: jest.fn().mockResolvedValue(undefined),
}));

const invalidGrant = () => new AxiosError('Rejected', 'ERR_BAD_REQUEST', undefined, undefined, {
  status: 400, statusText: 'Bad Request', headers: {}, config: {headers: new AxiosHeaders()},
  data: {error: 'invalid_grant'},
});
const user = {
  id: 'citizen', accessToken: 'test-access-token', idToken: 'test-id-token', email: 'test@example.com',
  givenName: 'Test', familyName: 'Citizen', roles: [config.get<string>('services.idam.citizenRole')],
};

const createApp = () => {
  const app = express();
  const store = new session.MemoryStore();
  app.use(session({secret: 'callback-integration-test', store, resave: false, saveUninitialized: false}));
  app.get('/seed', (req, res) => {
    (req as AppRequest).session.assignClaimURL = req.query.assignClaim ? ASSIGN_CLAIM_URL : undefined;
    (req as AppRequest).session.claimIssueTasklist = Boolean(req.query.taskList);
    res.sendStatus(204);
  });
  new OidcMiddleware().enableFor(app);
  app.get(UNAUTHORISED_URL, (_req, res) => res.sendStatus(403));
  app.get(DASHBOARD_URL, (_req, res) => res.sendStatus(200));
  return app;
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return {promise, resolve};
};

describe('duplicate OIDC callbacks with a shared session store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserDetails as jest.Mock).mockReturnValue(user);
    (getSessionIssueTime as jest.Mock).mockReturnValue(123);
  });

  it('reloads the successful login into a request which started before it was saved', async () => {
    const app = createApp();
    const seed = await request(app).get('/seed');
    const cookie = seed.headers['set-cookie'];
    const firstExchange = deferred<{id_token: string; access_token: string}>();
    const secondExchange = deferred<void>();
    const bothStarted = deferred<void>();
    const firstStarted = deferred<void>();
    (getOidcResponse as jest.Mock)
      .mockImplementationOnce(() => { firstStarted.resolve(); return firstExchange.promise; })
      .mockImplementationOnce(async () => { bothStarted.resolve(); await secondExchange.promise; throw invalidGrant(); });
    const first = request(app).get(CALLBACK_URL).query({code: 'same-code'}).set('Cookie', cookie).then(r => r);
    await firstStarted.promise;
    const second = request(app).get(CALLBACK_URL).query({code: 'same-code'}).set('Cookie', cookie).then(r => r);
    await bothStarted.promise;
    firstExchange.resolve({id_token: 'test-id-token', access_token: 'test-access-token'});
    expect((await first).headers.location).toBe(DASHBOARD_URL);
    secondExchange.resolve();
    const replay = await second;
    expect(replay.status).toBe(302);
    expect(replay.headers.location).toBe(DASHBOARD_URL);
    expect(getUserDetails).toHaveBeenCalledTimes(1);
    // The replay has not overwritten the stored login with its initial snapshot.
    const dashboard = await request(app).get(DASHBOARD_URL).set('Cookie', cookie);
    expect(dashboard.status).toBe(200);
  });

  it('does not overwrite a login when the duplicate fails before the first callback saves', async () => {
    const app = createApp();
    const seed = await request(app).get('/seed');
    const cookie = seed.headers['set-cookie'];
    const exchange = deferred<{id_token: string; access_token: string}>();
    const started = deferred<void>();
    (getOidcResponse as jest.Mock)
      .mockImplementationOnce(() => { started.resolve(); return exchange.promise; })
      .mockRejectedValueOnce(invalidGrant());
    const first = request(app).get(CALLBACK_URL).query({code: 'same-code'}).set('Cookie', cookie).then(r => r);
    await started.promise;
    const replay = await request(app).get(CALLBACK_URL).query({code: 'same-code'}).set('Cookie', cookie);
    expect(replay.status).toBe(302);
    expect(replay.headers.location).toBe(SIGN_IN_URL);
    exchange.resolve({id_token: 'test-id-token', access_token: 'test-access-token'});
    expect((await first).headers.location).toBe(DASHBOARD_URL);
    expect((await request(app).get(DASHBOARD_URL).set('Cookie', cookie)).status).toBe(200);
    expect(getUserDetails).toHaveBeenCalledTimes(1);
  });

  it('recovers an invalid grant without granting access to an unauthenticated session', async () => {
    const app = createApp();
    (getOidcResponse as jest.Mock).mockRejectedValue(invalidGrant());
    const response = await request(app).get(CALLBACK_URL).query({code: 'expired-or-reused'});
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(SIGN_IN_URL);
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it.each(['', '?assignClaim=true', '?taskList=true'])(
    'ends a non-citizen sign-in at the unauthorised page, including saved journeys (%s)', async seedQuery => {
      const agent = request.agent(createApp());
      await agent.get(`/seed${seedQuery}`);
      (getUserDetails as jest.Mock).mockReturnValue({...user, roles: ['caseworker']});
      (getOidcResponse as jest.Mock).mockResolvedValue({id_token: 'test-id-token', access_token: 'test-access-token'});

      const callback = await agent.get(CALLBACK_URL).query({code: 'non-citizen-code'});
      expect(callback.headers.location).toBe(UNAUTHORISED_URL);
      expect((await agent.get(callback.headers.location)).status).toBe(403);
      expect(getOidcResponse).toHaveBeenCalledTimes(1);
      expect((await agent.get(DASHBOARD_URL)).headers.location).toBe(SIGN_IN_URL);
    },
  );

  it('ends a rejected non-citizen grant at the unauthorised page without restarting sign-in', async () => {
    const agent = request.agent(createApp());
    (getUserDetails as jest.Mock).mockReturnValue({...user, roles: ['caseworker']});
    (getOidcResponse as jest.Mock)
      .mockResolvedValueOnce({id_token: 'test-id-token', access_token: 'test-access-token'})
      .mockRejectedValueOnce(invalidGrant());
    await agent.get(CALLBACK_URL).query({code: 'non-citizen-code'});

    const replay = await agent.get(CALLBACK_URL).query({code: 'non-citizen-code'});
    expect(replay.headers.location).toBe(UNAUTHORISED_URL);
    expect((await agent.get(replay.headers.location)).status).toBe(403);
    expect(getUserDetails).toHaveBeenCalledTimes(1);
    expect((await agent.get(DASHBOARD_URL)).headers.location).toBe(SIGN_IN_URL);
  });
});
