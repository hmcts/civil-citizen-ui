import {MatchersV3, PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {PACT_DIRECTORY_PATH} from '../utils';

const {like} = MatchersV3;
const TOKEN = 'Bearer reference-data-access-token';
const auth = {Authorization: TOKEN};
const request = (): AppRequest => ({
  session: {user: {id: 'cui-reference-user', accessToken: 'reference-data-access-token'}},
  locals: {}, params: {}, query: {},
} as unknown as AppRequest);

describe('Civil Service reference data', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({spec: SpecificationVersion.SPECIFICATION_VERSION_V4, consumer: 'civil_citizen_ui', provider: 'civil_service',
      dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });
  const exercise = (check: (client: CivilServiceClient) => Promise<void>) =>
    provider.executeTest(server => check(new CivilServiceClient(server.url)));

  test.each([
    {description: 'populated court locations', state: 'Court locations are available', body: [{code: like('EXAMPLE-COURT'), label: like('Example Court - 1 Example Street - EX1 2PL')}]},
    {description: 'empty court locations', state: 'No court locations are available', body: []},
  ])('retrieves $description', async example => {
    provider.addInteraction({states: [{description: example.state}], uponReceiving: `a request for ${example.description}`,
      withRequest: {method: 'GET', path: '/locations/courtLocations', headers: auth},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: example.body}});
    await exercise(async client => {
      const locations = await client.getCourtLocations(request());
      expect(locations).toHaveLength(example.body.length);
      if (example.body.length) {
        expect(locations[0]).toMatchObject({code: expect.any(String), label: 'Example Court - 1 Example Street - EX1 2PL'});
      }
    });
  });

  test.each([
    {description: 'populated airlines', state: 'Airlines are available', body: [{airline: like('Example Air'), epimsID: like('AIR-001')}]},
    {description: 'empty airlines', state: 'No airlines are available', body: []},
  ])('retrieves $description', async example => {
    provider.addInteraction({states: [{description: example.state}], uponReceiving: `a request for ${example.description}`,
      withRequest: {method: 'GET', path: '/airlines', headers: auth},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: example.body}});
    await exercise(async client => {
      const airlines = await client.getAirlines(request());
      expect(airlines).toHaveLength(example.body.length);
      if (example.body.length) {
        expect(airlines[0]).toMatchObject({airline: 'Example Air', epimsID: 'AIR-001'});
      }
    });
  });
});
