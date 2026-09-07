import { Matchers, Pact } from '@pact-foundation/pact';
import { CivilServiceClient } from '../../../main/app/client/civilServiceClient';
import { AppRequest } from '../../../main/common/models/AppRequest';
import { CaseEvent } from '../../../main/common/models/events/caseEvent';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';

const { like } = Matchers;
const CASE_ID = '1111222233334444';
const USER_ID = 'cui-user-id';
const ACCESS_TOKEN = 'some-access-token';
let providerPort = 9291;

const request = {
  session: { user: { id: USER_ID, accessToken: ACCESS_TOKEN } },
  locals: { env: '', lang: '' },
  params: {},
} as unknown as AppRequest;

const createProvider = () => new Pact({
  consumer: 'civil_citizen_ui',
  provider: 'civil_service',
  host: '127.0.0.1',
  port: providerPort++,
  dir: PACT_DIRECTORY_PATH,
  log: PACT_LOG_PATH,
  logLevel: 'info',
});

describe('Civil Service create-claim contract', () => {
  let client: CivilServiceClient;
  let provider: Pact;

  beforeEach(async () => {
    provider = createProvider();
    await provider.setup();
    client = new CivilServiceClient(provider.mockService.baseUrl);
  });

  afterEach(async () => {
    await provider.verify();
    await provider.finalize();
  });

  test('looks up the claim issue fee fields consumed by CUI', async () => {
    await provider.addInteraction({
      state: 'A claim issue fee is available for a claim amount of 1000',
      uponReceiving: 'a request for the claim issue fee',
      withRequest: {
        method: 'GET', path: '/fees/claim/1000',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          calculatedAmountInPence: like('11500'),
          code: like('FEE0209'),
        },
      },
    });

    await expect(client.getClaimFeeData(1000, request)).resolves.toEqual({
      calculatedAmountInPence: 11500, code: 'FEE0209',
    });
  });

  test('submits the create-claim event and consumes the returned case identity', async () => {
    await provider.addInteraction({
      state: `Draft case ${CASE_ID} can be submitted by the CUI user`,
      uponReceiving: 'a request to submit a create-claim event',
      withRequest: {
        method: 'POST', path: `/cases/${CASE_ID}/citizen/${USER_ID}/event`,
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: { event: CaseEvent.CREATE_LIP_CLAIM, caseDataUpdate: {} },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: like(Number(CASE_ID)),
          state: like('PENDING_CASE_ISSUED'),
          case_data: like({}),
        },
      },
    });

    const claim = await client.submitEvent(CaseEvent.CREATE_LIP_CLAIM, CASE_ID, {}, request);
    expect(claim.id).toBe(CASE_ID);
    expect(claim.ccdState).toBe('PENDING_CASE_ISSUED');
  });

});
