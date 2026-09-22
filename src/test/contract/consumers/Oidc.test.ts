import { createHmac } from 'crypto';
import { Pact, Matchers } from '@pact-foundation/pact';
import config from 'config';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';
import { getOidcResponse, getSessionIssueTime, getUserDetails, OidcResponse } from '../../../main/app/auth/user/oidc';

jest.mock('config');

const mockProvider = new Pact({
  log: PACT_LOG_PATH,
  dir: PACT_DIRECTORY_PATH,
  logLevel: 'info',
  consumer: 'civil_citizen_ui',
  provider: 'idamApi_oidc',
  port: 5000,
});

describe('OIDC Pact Test', () => {
  beforeAll(async () => {
    await mockProvider.setup();
  });
  afterAll(async () => {
    await mockProvider.finalize();
  });
  afterEach(async () => {
    await mockProvider.verify();
  });

  describe('get OIDC response and consume sign-in claims', () => {
    const claims = {
      uid: 'cui-test-user-001',
      sub: 'cui-test-user@example.test',
      given_name: 'Contract',
      family_name: 'User',
      roles: ['citizen'],
      iat: 1_756_000_000,
    };
    const encodeBase64Url = (value: string): string => Buffer.from(value).toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const signingInput = `${encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${encodeBase64Url(JSON.stringify(claims))}`;
    const signature = createHmac('sha256', 'cui-contract-only-signing-key')
      .update(signingInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const syntheticIdToken = `${signingInput}.${signature}`;
    const authorizationCode = 'code+with/special chars';
    const oidcResponse: OidcResponse = {
      id_token: syntheticIdToken,
      access_token: 'synthetic-access-token',
    };
    const encodedClaims = encodeBase64Url(JSON.stringify(claims));
    const jwtPattern = `^[A-Za-z0-9_-]+\\.${encodedClaims}\\.[A-Za-z0-9_-]+$`;

    beforeAll(async () => {
      await mockProvider.addInteraction({
        state: 'IDAM returns an ID token with CUI sign-in claims',
        uponReceiving: 'an authorisation-code request for a token with CUI sign-in claims',
        withRequest: {
          method: 'POST',
          path: '/o/token',
          headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          },
          body: 'client_id=someClientId&client_secret=someClientSecret&grant_type=authorization_code&redirect_uri=someURL&code=code%2Bwith%2Fspecial%20chars',
        },
        willRespondWith: {
          status: 200,
          headers: {'Content-Type': 'application/json'},
          body: {
            access_token: Matchers.like(oidcResponse.access_token),
            id_token: Matchers.regex({ matcher: jwtPattern, generate: oidcResponse.id_token }),
          },
        },
      });
    });

    test('decodes the claims consumed by sign-in from the token response', async () => {
      (config.get as jest.Mock).mockImplementation((value) => {
        switch (value) {
          case 'services.idam.clientID':
            return 'someClientId';
          case 'services.idam.clientSecret':
            return 'someClientSecret';
          case 'services.idam.tokenURL':
            return `${mockProvider.mockService.baseUrl}/o/token`;
          default:
            return '';
        }
      });

      const response = await getOidcResponse('someURL', authorizationCode);

      expect(response).toEqual(oidcResponse);
      expect(getUserDetails(response)).toEqual({
        accessToken: oidcResponse.access_token,
        idToken: oidcResponse.id_token,
        id: claims.uid,
        email: claims.sub,
        givenName: claims.given_name,
        familyName: claims.family_name,
        roles: claims.roles,
      });
      expect(getSessionIssueTime(response)).toBe(claims.iat);
    });
  });
});
