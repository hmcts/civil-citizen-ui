import { Pact } from '@pact-foundation/pact';
import { resolve } from 'path';
import axios from 'axios';
import { PACT_DIRECTORY_PATH } from '../utils';

const mockProvider = new Pact({
  log: resolve(process.cwd(), 'src/test/contract/log', 'pact.log'),
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

  describe('Service Authorisation Provider generate service token', () => {
    const BASE_URL = 'http://localhost:4502';
    const MICRO_SERVICE_NAME = 'xui_webapp';
    const MICRO_SERVICE_TOKEN = 'someToken';

    beforeAll(async () => {
      await mockProvider.addInteraction({
        state: 'microservice with valid credentials',
        uponReceiving: 'a request for a token',
        withRequest: {
          method: 'POST',
          path: '/lease',
          body: {microservice: MICRO_SERVICE_NAME, oneTimePassword: 'password'},
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
      const response = await axios.post(`${BASE_URL}/lease`, {
        microservice: MICRO_SERVICE_NAME,
        oneTimePassword: 'password',
      });

      expect(response.status).toBe(200);
      expect(response.data).toBe(MICRO_SERVICE_TOKEN);

      await mockProvider.verify();
    });
  });
});
