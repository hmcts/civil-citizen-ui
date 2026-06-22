import { Pact } from '@pact-foundation/pact';
import { generateSync } from 'otplib';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';
import { generateServiceToken } from 'client/serviceAuthProviderClient';

jest.mock('otplib');

const mockProvider = new Pact({
  log: PACT_LOG_PATH,
  dir: PACT_DIRECTORY_PATH,
  logLevel: 'info',
  consumer: 'civil_citizen_ui',
  provider: 's2s_auth',
  port: 4502,
});

describe('Service Authorisation Provider Pact Test', () => {
  beforeAll(async () => {
    await mockProvider.setup();
  });
  afterAll(async () => {
    await mockProvider.finalize();
  });
  afterEach(async () => {
    await mockProvider.verify();
  });

  describe('Service Authorisation Provider generate service token', () => {
    const MICRO_SERVICE_NAME = 'someMicroServiceName';
    const MICRO_SERVICE_TOKEN = 'someMicroServiceToken';
    const PASSWORD = 'somePassword';

    beforeAll(async () => {
      await mockProvider.addInteraction({
        state: 'microservice with valid credentials',
        uponReceiving: 'a request for a token',
        withRequest: {
          method: 'POST',
          path: '/lease',
          body: {microservice: MICRO_SERVICE_NAME, oneTimePassword: PASSWORD},
          headers: {'Content-Type': 'application/json'},
        },
        willRespondWith: {
          status: 200,
          headers: {'Content-Type': 'text/plain'},
          body: MICRO_SERVICE_TOKEN,
        },
      });
    });

    test('should receive a token when making a request to the lease endpoint', async () => {
      (generateSync as jest.Mock).mockImplementation(() => PASSWORD);

      const response = await generateServiceToken(MICRO_SERVICE_NAME, 'someS2sSecret');

      expect(response).toBe(MICRO_SERVICE_TOKEN);
    });
  });
});
