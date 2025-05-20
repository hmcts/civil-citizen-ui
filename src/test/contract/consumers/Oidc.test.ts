import { Pact, Matchers } from '@pact-foundation/pact';
import config from 'config';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';
import { getOidcResponse, OidcResponse } from '../../../main/app/auth/user/oidc';

jest.mock('config');

const mockProvider = new Pact({
  log: PACT_LOG_PATH,
  dir: PACT_DIRECTORY_PATH,
  logLevel: 'info',
  consumer: 'civil_citizen_ui',
  provider: 'idamApi_oidc',
  port: 5000,
});

describe('Odic Pact Test', () => {
  beforeAll(async () => {
    await mockProvider.setup();
  });
  afterAll(async () => {
    await mockProvider.finalize();
  });
  afterEach(async () => {
    await mockProvider.verify();
  });

  describe('get Oidc response', () => {
    const odicResponse: OidcResponse = {
      id_token: 'someIdToken',
      access_token: 'someAccessToken',
    };

    beforeAll(async () => {
      await mockProvider.addInteraction({
        state: 'a token is requested',
        uponReceiving: 'a request to get user details',
        withRequest: {
          method: 'POST',
          path: '/o/token',
          headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          },
          body: 'client_id=someClientId&client_secret=someClientSecret&grant_type=authorization_code&redirect_uri=someURL&code=someCode',
        },
        willRespondWith: {
          status: 200,
          headers: {'Content-Type': 'application/json'},
          body: {
            access_token: Matchers.like(odicResponse.access_token),
            id_token: odicResponse.id_token,
          },
        },
      });
    });

    test('should receive a response when making a request to the idam token endpoint', async () => {
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

      const response = await getOidcResponse('someURL', 'someCode');

      expect(response).toEqual(odicResponse);
    });
  });
});
