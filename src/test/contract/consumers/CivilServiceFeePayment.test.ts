import { Pact, Matchers } from '@pact-foundation/pact';
import { CivilServiceClient } from '../../../main/app/client/civilServiceClient';
import { AppRequest } from '../../../main/common/models/AppRequest';
import { PACT_DIRECTORY_PATH, PACT_LOG_PATH } from '../utils';

const createMockProvider = () => new Pact({
  log: PACT_LOG_PATH,
  dir: PACT_DIRECTORY_PATH,
  logLevel: 'info',
  consumer: 'civil_citizen_ui',
  provider: 'civil_service',
  host: '127.0.0.1',
});

const { like, decimal } = Matchers;

const CLAIM_REFERENCE = '1234567890123456';
const FEE_TYPE = 'CLAIMISSUED';
const PAYMENT_REFERENCE = 'RC-1701-0909-0602-0418';
const ACCESS_TOKEN = 'some-access-token';

const createAppRequest = (): AppRequest =>
  ({
    session: {
      user: {
        accessToken: ACCESS_TOKEN,
        id: '',
        email: '',
        givenName: '',
        familyName: '',
        roles: [],
      },
      lang: undefined,
      previousUrl: '',
      claimId: '',
      taskLists: [],
      assignClaimURL: '',
      claimIssueTasklist: false,
      firstContact: {},
      fileUpload: '',
      issuedAt: 0,
      dashboard: { taskIdHearingUploadDocuments: '' },
      qmShareConfirmed: false,
    },
    locals: {
      env: '',
      lang: '',
    },
    body: {},
  } as unknown as AppRequest);

describe('Civil Service fee payment contract', () => {
  let civilServiceClient: CivilServiceClient;
  let mockProvider: Pact;

  beforeEach(async () => {
    mockProvider = createMockProvider();
    await mockProvider.setup();
    civilServiceClient = new CivilServiceClient(mockProvider.mockService.baseUrl);
  });

  afterEach(async () => {
    await mockProvider.verify();
    await mockProvider.finalize();
  });

  describe('Create payment request for claim issue fee', () => {
    beforeEach(async () => {
      await mockProvider.addInteraction({
        state: 'Claim issue payment can be initiated for case 1234567890123456',
        uponReceiving: 'a request to create a GovPay payment',
        withRequest: {
          method: 'POST',
          path: `/fees/${FEE_TYPE}/case/${CLAIM_REFERENCE}/payment`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
          },
          body: '',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            externalReference: like('2023-1701090705688'),
            paymentReference: like(PAYMENT_REFERENCE),
            status: like('Initiated'),
            nextUrl: like('https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960'),
            dateCreated: decimal(1701090906.313),
          },
        },
      });
    });

    test('returns payment redirect information', async () => {
      const request = createAppRequest();

      const response = await civilServiceClient.getFeePaymentRedirectInformation(
        CLAIM_REFERENCE,
        FEE_TYPE,
        request,
      );

      expect(response).toEqual(expect.objectContaining({
        externalReference: '2023-1701090705688',
        paymentReference: PAYMENT_REFERENCE,
        status: 'Initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      }));
      expect(response.dateCreated).toEqual(expect.any(Number));
    });
  });

  describe('Retrieve payment status for claim issue fee', () => {
    beforeEach(async () => {
      await mockProvider.addInteraction({
        state: 'Payment status SUCCESS is available for payment RC-1701-0909-0602-0418',
        uponReceiving: 'a request to retrieve GovPay payment status',
        withRequest: {
          method: 'GET',
          path: `/fees/${FEE_TYPE}/case/${CLAIM_REFERENCE}/payment/${PAYMENT_REFERENCE}/status`,
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            externalReference: like('2023-1701090705688'),
            paymentReference: like(PAYMENT_REFERENCE),
            status: like('Success'),
            paymentFor: like('claimissued'),
            paymentAmount: like(200),
          },
        },
      });
    });

    test('returns current payment status', async () => {
      const request = createAppRequest();

      const response = await civilServiceClient.getFeePaymentStatus(
        CLAIM_REFERENCE,
        PAYMENT_REFERENCE,
        FEE_TYPE,
        request,
      );

      expect(response).toEqual(expect.objectContaining({
        externalReference: '2023-1701090705688',
        paymentReference: PAYMENT_REFERENCE,
        status: 'Success',
      }));
    });
  });
});
