import {PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {PACT_DIRECTORY_PATH} from '../utils';

const CASE_ID = '1111222233334444';
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const request = {session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}}, locals: {}} as AppRequest;
const path = `/cases/${CASE_ID}/citizen/cui-user-id/event`;
const responses: Record<string, object> = {
  default: {ccjPaymentPaidSomeOption: 'No', ccjPaymentPaidSomeAmount: null, ccjJudgmentAmountClaimFee: '11500', ccjJudgmentLipInterest: '0',
    applicant1RepaymentOptionForDefendantSpec: 'SET_DATE', applicant1RequestedPaymentDateForDefendantSpec: {paymentSetDate: '2025-06-01'}, totalClaimAmount: 1000},
  admission: {ccjPaymentPaidSomeOption: 'Yes', ccjPaymentPaidSomeAmount: '20000', ccjJudgmentAmountClaimFee: '11500', ccjJudgmentLipInterest: '0',
    applicant1RepaymentOptionForDefendantSpec: 'REPAYMENT_PLAN', applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: 'ONCE_ONE_MONTH', applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 10000, applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: '2025-06-01', totalClaimAmount: 1000},
  settled: {applicant1ClaimSettledDate: '2025-06-02'},
  signed: {respondentSignSettlementAgreement: 'Yes'},
  paid: {joJudgmentPaidInFull: {dateOfFullPaymentMade: '2025-06-03', confirmFullPaymentMade: ['CONFIRMED']}},
};
const events: Record<string, string> = {default: 'DEFAULT_JUDGEMENT_SPEC', admission: 'REQUEST_JUDGEMENT_ADMISSION_SPEC', settled: 'LIP_CLAIM_SETTLED', signed: 'DEFENDANT_SIGN_SETTLEMENT_AGREEMENT', paid: 'JUDGMENT_PAID_IN_FULL'};

describe('Civil Service judgment and settlement events', () => {
  test.each(Object.keys(events))('submits the %s event through its real client wrapper', async kind => {
    const provider = new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service', spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
    const update = responses[kind];
    provider.addInteraction({states: [{description: `The ${kind} judgment or settlement event can be submitted`}],
      uponReceiving: `a ${events[kind]} citizen event`, withRequest: {method: 'POST', path, headers, body: {event: events[kind], caseDataUpdate: update}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {id: Number(CASE_ID), state: 'CASE_PROGRESSION', last_modified: '2025-06-04T10:00:00', case_data: update}}});
    await provider.executeTest(async server => {
      const client = new CivilServiceClient(server.url);
      let result: Claim;
      if (kind === 'default') result = await client.submitClaimantResponseDJEvent(CASE_ID, update, request);
      if (kind === 'admission') result = await client.submitClaimantResponseForRequestJudgementAdmission(CASE_ID, update as any, request);
      if (kind === 'settled') result = await client.submitClaimSettled(CASE_ID, update, request);
      if (kind === 'signed') result = await client.submitDefendantSignSettlementAgreementEvent(CASE_ID, update, request);
      if (kind === 'paid') result = await client.submitJudgmentPaidInFull(CASE_ID, update, request);
      expect(result).toBeInstanceOf(Claim);
      expect(result).toMatchObject({id: CASE_ID, ccdState: 'CASE_PROGRESSION', lastModifiedDate: '2025-06-04T10:00:00'});
    });
  });
});
