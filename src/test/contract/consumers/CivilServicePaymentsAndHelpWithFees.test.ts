import {MatchersV3, PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GaServiceClient} from 'client/gaServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {YesNo} from 'form/models/yesNo';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {PACT_DIRECTORY_PATH} from '../utils';
// Prevent the unrelated Redis store import from starting the full web application.
jest.mock('../../../main/app', () => ({app: {locals: {}}}));
jest.mock('config', () => {
  const realConfig = jest.requireActual('config');
  return {get: (key: string) => realConfig.get(key)};
});

const CASE_ID = '1234567890123456';
const PAYMENT_REFERENCE = 'RC-1701-0909-0602-0418';
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const request = () => ({session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}},
  params: {appId: CASE_ID}, locals: {}} as unknown as AppRequest);
const paymentPath = (kind: string) => kind === 'GA' ? `/fees/case/${CASE_ID}/ga/payment`
  : `/fees/${kind}/case/${CASE_ID}/payment`;

// Only redirect configuration to Pact; service translators, HTTP clients and converters remain real.
function loadServices(url: string, load: () => void) {
  jest.isolateModules(() => {
    const config = require('config');
    const get = config.get.bind(config);
    const spy = jest.spyOn(config, 'get').mockImplementation((key: string) =>
      ['services.civilService.url', 'services.generalApplication.url'].includes(key) ? url : get(key));
    try {
      load();
    } finally {
      spy.mockRestore();
    }
  });
}

describe('Civil Service payments and Help with Fees', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });

  test('creates a hearing payment with the empty-string request', async () => {
    provider.addInteraction({states: [{description: 'A hearing payment can be initiated'}],
      uponReceiving: 'a request to create a hearing payment',
      withRequest: {method: 'POST', path: paymentPath('HEARING'), headers, body: ''},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {
        externalReference: '2023-1701090705688', paymentReference: PAYMENT_REFERENCE, status: 'Initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/hearing-payment',
        dateCreated: MatchersV3.timestamp("yyyy-MM-dd'T'HH:mm:ss.SSSX", '2023-11-27T13:15:06.313Z'),
        paymentAmount: null,
      }}});
    await provider.executeTest(async server => {
      const result = await new CivilServiceClient(server.url).getFeePaymentRedirectInformation(CASE_ID, 'HEARING', request());
      expect(result).toBeInstanceOf(PaymentInformation);
      expect(result).toMatchObject({externalReference: '2023-1701090705688', paymentReference: PAYMENT_REFERENCE,
        status: 'Initiated', nextUrl: 'https://card.payments.service.gov.uk/secure/hearing-payment',
        dateCreated: '2023-11-27T13:15:06.313Z', paymentAmount: null});
    });
  });

  describe.each(['CLAIMISSUED', 'HEARING', 'GA'])('%s payment status', kind => {
    // The existing claim-issue and GA success interactions are reused.
    test.each(kind === 'HEARING' ? ['Success', 'Failed', 'Initiated', 'Pending'] : ['Failed', 'Initiated', 'Pending'])('preserves the case-sensitive %s status', async status => {
      const body: Record<string, string | number | null> = {externalReference: '2023-1701090705688', paymentReference: PAYMENT_REFERENCE,
        status, paymentAmount: 200, paymentFor: kind === 'GA' ? null : kind.toLowerCase(), nextUrl: null,
        errorCode: status === 'Failed' ? 'P010' : null,
        errorDescription: status === 'Failed' ? 'Payment was cancelled by the user' : null};
      provider.addInteraction({states: [{description: `The ${kind} payment status is ${status}`}],
        uponReceiving: `a ${kind} payment status request returning ${status}`,
        withRequest: {method: 'GET', path: `${paymentPath(kind)}/${PAYMENT_REFERENCE}/status`, headers},
        willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body}});
      await provider.executeTest(async server => {
        const result = kind === 'GA'
          ? await new GaServiceClient(server.url).getGaFeePaymentStatus(CASE_ID, PAYMENT_REFERENCE, request())
          : await new CivilServiceClient(server.url).getFeePaymentStatus(CASE_ID, PAYMENT_REFERENCE, kind, request());
        expect(result).toBeInstanceOf(PaymentInformation);
        expect(result).toMatchObject(body);
      });
    });

    test('propagates a missing upstream payment', async () => {
      provider.addInteraction({states: [{description: `The ${kind} payment cannot be found upstream`}],
        uponReceiving: `a ${kind} status request for a missing payment`,
        withRequest: {method: 'GET', path: `${paymentPath(kind)}/${PAYMENT_REFERENCE}/status`, headers},
        willRespondWith: {status: 500}});
      await provider.executeTest(async server => {
        const result = kind === 'GA'
          ? new GaServiceClient(server.url).getGaFeePaymentStatus(CASE_ID, PAYMENT_REFERENCE, request())
          : new CivilServiceClient(server.url).getFeePaymentStatus(CASE_ID, PAYMENT_REFERENCE, kind, request());
        await expect(result).rejects.toMatchObject({isAxiosError: true, response: {status: 500}});
      });
    });
  });

  test('submits the translated hearing Help with Fees reference', async () => {
    provider.addInteraction({states: [{description: 'Hearing Help with Fees can be submitted'}],
      uponReceiving: 'a hearing Help with Fees submission',
      withRequest: {method: 'POST', path: `/cases/${CASE_ID}/citizen/cui-user-id/event`, headers,
        body: {event: 'APPLY_HELP_WITH_HEARING_FEE', caseDataUpdate: {
          hwfFeeType: 'HEARING', hearingHelpFeesReferenceNumber: 'HWF-123-456'}}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {
        id: Number(CASE_ID), state: 'HEARING_READINESS', last_modified: '2025-02-03T10:00:00',
        case_data: {hearingHelpFeesReferenceNumber: 'HWF-123-456', hwfFeeType: 'HEARING'},
      }}});
    await provider.executeTest(async server => {
      let trigger: typeof import('services/features/caseProgression/hearingFee/hearingFeeService').triggerNotifyEvent;
      let submission: jest.SpyInstance;
      loadServices(server.url, () => {
        const Client = require('client/civilServiceClient').CivilServiceClient;
        submission = jest.spyOn(Client.prototype, 'submitEvent'); // Observe the real returned conversion.
        trigger = require('services/features/caseProgression/hearingFee/hearingFeeService').triggerNotifyEvent;
      });
      const claim = {caseProgression: {helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-123-456')}} as Claim;
      try {
        await expect(trigger(CASE_ID, request(), claim)).resolves.toBeUndefined();
        const result = await submission.mock.results[0].value;
        expect(result).toMatchObject({id: CASE_ID, ccdState: 'HEARING_READINESS', lastModifiedDate: '2025-02-03T10:00:00',
          caseProgression: {helpFeeReferenceNumberForm: {option: YesNo.YES, referenceNumber: 'HWF-123-456'}}});
      } finally {
        submission.mockRestore();
      }
    });
  });

  test.each(['Yes', 'No', 'rejected'])('submits GA Help with Fees (%s)', async variant => {
    const help = variant === 'No' ? {helpWithFee: 'No'}
      : {helpWithFee: 'Yes', helpWithFeesReferenceNumber: 'HWF-123-456'};
    provider.addInteraction({states: [{description: `GA Help with Fees submission is ${variant}`}],
      uponReceiving: `a GA Help with Fees submission for ${variant}`,
      withRequest: {method: 'POST', path: `/cases/${CASE_ID}/ga/citizen/cui-user-id/event`, headers,
        body: {event: 'NOTIFY_HELP_WITH_FEE', caseDataUpdate: {generalAppHelpWithFees: help}}},
      willRespondWith: {status: variant === 'rejected' ? 422 : 200}});
    await provider.executeTest(async server => {
      let submit: typeof import('services/features/generalApplication/generalApplicationService').saveAndTriggerNotifyGaHwfEvent;
      loadServices(server.url, () => { submit = require('services/features/generalApplication/generalApplicationService').saveAndTriggerNotifyGaHwfEvent; });
      const result = submit(request(), new ApplyHelpFeesReferenceForm(variant === 'No' ? YesNo.NO : YesNo.YES, 'HWF-123-456'));
      if (variant === 'rejected') {
        await expect(result).rejects.toMatchObject({isAxiosError: true, response: {status: 422}});
      } else {
        await expect(result).resolves.toBeUndefined();
      }
    });
  });
});
