import {MatchersV3, PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {FeeRange} from 'models/feeRange';
import {Interest} from 'form/models/interest/interest';
import {InterestStartDate} from 'form/models/interest/interestStartDate';
import {YesNo} from 'form/models/yesNo';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {InterestClaimFromType, InterestEndDateType, SameRateInterestType} from 'form/models/claimDetails';
import {translateDraftClaimToCCDInterest} from 'services/translation/claim/ccdTranslation';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GAFeeRequestBody} from 'services/features/generalApplication/feeDetailsService';
import {toCCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PACT_DIRECTORY_PATH} from '../utils';
import examples from '../fixtures/calculations.json';

const {like, number, regex} = MatchersV3;
const CASE_ID = '1111222233334444';
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const request = (): AppRequest => ({session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}},
  params: {id: CASE_ID}, locals: {}} as unknown as AppRequest);
const fee = {calculatedAmountInPence: like('30300'), code: like('FEE0442'), version: like('2')};

describe('Civil Service fees, interest, deadlines and repayment decisions', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({spec: SpecificationVersion.SPECIFICATION_VERSION_V4, consumer: 'civil_citizen_ui', provider: 'civil_service', dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });
  const exercise = (check: (client: CivilServiceClient) => Promise<void>) =>
    provider.executeTest(server => check(new CivilServiceClient(server.url)));

  test.each(['statutory', 'different rate zero', 'breakdown'] as const)('calculates %s interest with translated input', async name => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.claimInterest = YesNo.YES;
    claim.submittedDate = new Date('2025-02-03T00:00:00.000Z');
    claim.interest = new Interest();
    claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    claim.interest.interestStartDate = new InterestStartDate('1', '1', '2025', 'Invoice overdue');
    claim.interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
    claim.interest.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC};
    if (name === 'different rate zero') {
      claim.interest.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: 5, reason: 'Contractual rate'};
      claim.interest.interestStartDate = new InterestStartDate('3', '2', '2025', 'Invoice overdue');
    } else if (name === 'breakdown') {
      claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
      claim.interest.sameRateInterestSelection = undefined;
      claim.interest.totalInterest = {amount: 12.34, reason: 'Interest on two invoices'};
    }
    const example = examples.interest[name];
    provider.addInteraction({states: [{description: `Claim interest ${name} can be calculated`}],
      uponReceiving: `a request to calculate ${name} claim interest`,
      withRequest: {method: 'POST', path: '/fees/claim/calculate-interest', headers: {'Content-Type': 'application/json'}, body: example.request},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: number(example.result)}});
    await exercise(async client => {
      const result = await client.calculateClaimInterest(translateDraftClaimToCCDInterest(claim), request());
      expect(typeof result).toBe('number');
      expect(result).toBe(example.result);
    });
  });

  test('reads the hearing fee amount used to render the total', async () => {
    provider.addInteraction({states: [{description: 'A hearing fee is available for a claim amount of 1000'}],
      uponReceiving: 'a request for the hearing fee', withRequest: {method: 'GET', path: '/fees/hearing/1000', headers},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: fee}});
    await exercise(async client => {
      const result = await client.getHearingAmount(1000, request());
      expect(result).toEqual({calculatedAmountInPence: '30300', code: 'FEE0442', version: '2'});
      expect(Number(result.calculatedAmountInPence) / 100).toBe(303);
    });
  });

  test('converts flat, percentage and open-ended fee ranges', async () => {
    provider.addInteraction({states: [{description: 'Flat and percentage fee ranges are available'}],
      uponReceiving: 'a request for fee ranges', withRequest: {method: 'GET', path: '/fees/ranges', headers},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: examples.ranges}});
    await exercise(async client => {
      const result = await client.getFeeRanges(request());
      expect(result.value).toHaveLength(2);
      const [flat, percentage] = result.value;
      expect(flat).toBeInstanceOf(FeeRange);
      expect(flat).toMatchObject({minRange: 0, maxRange: 300, currentVersion: {flatAmount: {amount: 35}}});
      expect(flat.formatFeeRangeToTableItem('en')).toEqual([{text: '£0 to £300'}, {text: '£35'}]);
      expect(percentage).toMatchObject({minRange: 10000, currentVersion: {percentageAmount: {percentage: 5}}});
      expect(percentage.maxRange).toBeNull();
      expect(percentage.formatFeeRangeToTableItem('en')[0]).toEqual({text: ' > £10,000'});
    });
  });

  test.each(['consent', 'notice', 'without notice', 'adjourn hearing'] as const)('gets the General Application fee for %s', async name => {
    const example = examples.generalApplication[name];
    const body: GAFeeRequestBody = {applicationTypes: example.applicationTypes as ApplicationTypeOption[],
      withConsent: example.withConsent, withNotice: example.withNotice, hearingDate: example.hearingDate};
    provider.addInteraction({states: [{description: `A General Application fee for ${name} is available`}],
      uponReceiving: `a General Application fee request for ${name}`,
      withRequest: {method: 'POST', path: '/fees/general-application', headers, body: example},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: fee}});
    await exercise(async client => {
      await expect(client.getGeneralApplicationFee(body, request())).resolves.toEqual({calculatedAmountInPence: '30300', code: 'FEE0442', version: '2'});
    });
  });

  test.each([0, 5])('calculates a response deadline plus %s days', async plusDays => {
    const date = plusDays === 0 ? '2025-02-03' : '2025-02-10';
    provider.addInteraction({states: [{description: `A response deadline with ${plusDays} extra days can be calculated`}],
      uponReceiving: `a response deadline request with ${plusDays} extra days`,
      withRequest: {method: 'POST', path: '/cases/response/deadline', headers, body: {responseDate: '2025-02-03T00:00:00.000Z', plusDays}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: like(date)}});
    await exercise(async client => {
      const result = await client.calculateExtendedResponseDeadline(new Date('2025-02-03T00:00:00.000Z'), plusDays, request());
      // The client type assertion does not construct a Date at runtime.
      expect(result).toBe(date);
      expect(new Date(result).toISOString()).toBe(`${date}T00:00:00.000Z`);
    });
  });

  test.each([true, false])('reads an agreed response deadline (present: %s)', async present => {
    provider.addInteraction({states: [{description: `An agreed response deadline is ${present ? 'present' : 'absent'}`}],
      uponReceiving: `an agreed response deadline lookup with ${present ? 'a date' : 'no date'}`,
      withRequest: {method: 'GET', path: `/cases/response/agreeddeadline/${CASE_ID}`, headers},
      willRespondWith: {status: 200, ...(present ? {headers: {'Content-Type': 'application/json'}, body: like('2025-02-10')} : {})}});
    await exercise(async client => {
      const result = await client.getAgreedDeadlineResponseDate(CASE_ID, request());
      if (present) {
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2025-02-10T00:00:00.000Z');
      } else {
        expect(result).toBeUndefined();
      }
    });
  });

  test.each(Object.values(RepaymentDecisionType))('consumes repayment decision %s for a translated plan', async decision => {
    const proposed = toCCDClaimantProposedPlan({paymentOption: PaymentOptionType.INSTALMENTS,
      repaymentPlan: {paymentAmount: 125, repaymentFrequency: 'MONTH', firstRepaymentDate: new Date('2025-03-01T00:00:00.000Z')}});
    provider.addInteraction({states: [{description: `The repayment decision is ${decision}`}],
      uponReceiving: `a claimant repayment plan returning ${decision}`,
      withRequest: {method: 'POST', path: `/cases/${CASE_ID}/courtDecision`, headers, body: examples.repayment},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: regex(`^${decision}$`, decision)}});
    await exercise(async client => {
      await expect(client.getCalculatedDecisionOnClaimantProposedRepaymentPlan(CASE_ID, request(), proposed)).resolves.toBe(decision);
    });
  });
});
