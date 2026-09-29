import {PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {responseClaim, responsePayload, responseVariants} from '../fixtures/responseClaims';
import requests from '../fixtures/responseRequests.json';
import {PACT_DIRECTORY_PATH} from '../utils';

const CASE_ID = '1111222233334444';
const request = {session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}}, locals: {}} as AppRequest;
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const path = `/cases/${CASE_ID}/citizen/cui-user-id/event`;
const details = (data: object, state = 'AWAITING_APPLICANT_INTENTION') => ({id: Number(CASE_ID), state,
  last_modified: '2025-05-01T10:00:00', case_data: data});

describe('Civil Service response and extension events', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });

  test.each(responseVariants)('submits the translated %s response', async variant => {
    const claimant = variant.startsWith('claimant-');
    const input = responseClaim(variant);
    const wire = requests[variant] as Record<string, unknown>;
    // Protect consumed response fields, independently of the larger translated request.
    const data: Record<string, unknown> = {respondent1ClaimResponseTypeForSpec: input.respondent1.responseType};
    const fields = claimant ? ['applicant1AcceptAdmitAmountPaidSpec', 'applicant1AcceptFullAdmitPaymentPlanSpec',
      'applicant1RepaymentOptionForDefendantSpec', 'applicant1SuggestInstalmentsPaymentAmountForDefendantSpec',
      'applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec', 'applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec',
      'applicant1RequestedPaymentDateForDefendantSpec', 'applicant1LiPResponseCarm']
      : ['respondent1LiPResponse', 'respondent1LiPResponseCarm', 'respondent1DQLanguage', 'defenceRouteRequired',
        'detailsOfWhyDoesYouDisputeTheClaim', 'defenceAdmitPartPaymentTimeRouteRequired', 'respondToAdmittedClaimOwingAmountPounds'];
    for (const field of fields) if (wire[field] !== undefined) data[field] = wire[field];
    if (!claimant) data.respondent1 = {type: 'INDIVIDUAL', individualFirstName: 'Sam', individualLastName: 'Example'};
    if (variant === 'full-admission') data.respondent1RepaymentPlan = {paymentAmount: '10000', repaymentFrequency: 'ONCE_ONE_MONTH', firstRepaymentDate: '2025-06-01'};
    if (variant === 'part-admission') data.respondToClaimAdmitPartLRspec = {whenWillThisAmountBePaid: '2025-06-01'};
    if (variant === 'claimant-instalments') data.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec = '20000';
    provider.addInteraction({states: [{description: `The ${variant} citizen response can be submitted`}],
      uponReceiving: `a translated ${variant} citizen response`,
      withRequest: {method: 'POST', path, headers,
        body: {event: claimant ? 'CLAIMANT_RESPONSE_CUI' : 'DEFENDANT_RESPONSE_CUI', caseDataUpdate: requests[variant]}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: details(data)}});
    await provider.executeTest(async server => {
      const client = new CivilServiceClient(server.url);
      const payload = responsePayload(variant);
      const result = claimant
        ? await client.submitClaimantResponseEvent(CASE_ID, payload, request)
        : await client.submitDefendantResponseEvent(CASE_ID, payload, request);
      expect(result).toBeInstanceOf(Claim);
      expect(result).toMatchObject({id: CASE_ID, ccdState: 'AWAITING_APPLICANT_INTENTION',
        lastModifiedDate: '2025-05-01T10:00:00', respondent1: {responseType: input.respondent1.responseType}});
      if (!claimant) {
        expect(result.respondent1.partyDetails.firstName).toBe('Sam');
        expect(result.claimBilingualLanguagePreference).toBe(input.claimBilingualLanguagePreference);
      }
      if (variant === 'defence' || variant === 'part-admission') {
        expect(result.directionQuestionnaire.welshLanguageRequirements.language).toEqual({speakLanguage: 'cy', documentsLanguage: 'cy-en'});
        expect(result.mediationCarm.isMediationEmailCorrect.option).toBe('yes');
      }
      if (variant === 'claimant-rejection') expect(result.claimantResponse.mediationCarm.isMediationEmailCorrect.option).toBe('yes');
      if (variant === 'defence') expect(result.rejectAllOfClaim.defence.text).toBe('The invoice was issued in error.');
      if (variant === 'full-admission') expect(result.fullAdmission.paymentIntention.repaymentPlan).toMatchObject({paymentAmount: 100, repaymentFrequency: 'MONTH'});
      if (variant === 'part-admission') expect(result.partialAdmission).toMatchObject({howMuchDoYouOwe: {amount: 600}, paymentIntention: {paymentOption: 'BY_SET_DATE'}});
      if (variant === 'claimant-acceptance' || variant === 'claimant-rejection') {
        expect(result.claimantResponse.hasPartAdmittedBeenAccepted.option).toBe(variant === 'claimant-acceptance' ? 'yes' : 'no');
      }
      if (variant === 'claimant-instalments') {
        expect(payload).toMatchObject({applicant1RepaymentOptionForDefendantSpec: 'REPAYMENT_PLAN',
          applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 20000,
          applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: 'ONCE_ONE_MONTH',
          applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: '2025-07-01'});
        expect(result.claimantResponse.suggestedPaymentIntention).toMatchObject({paymentOption: 'INSTALMENTS',
          repaymentPlan: {paymentAmount: '20000', repaymentFrequency: 'MONTH', firstRepaymentDate: new Date('2025-07-01')}});
      }
      if (variant === 'claimant-set-date') {
        expect(payload).toMatchObject({applicant1RepaymentOptionForDefendantSpec: 'SET_DATE', applicant1RequestedPaymentDateForDefendantSpec: {paymentSetDate: '2025-07-01'}});
        expect(result.claimantResponse.suggestedPaymentIntention).toMatchObject({paymentOption: 'BY_SET_DATE', paymentDate: new Date('2025-07-01')});
      }
    });
  });

  test('submits an agreed response extension using the calculated date string', async () => {
    // The deadline calculation client returns an ISO date string despite its Date annotation.
    const data = {respondentSolicitor1AgreedDeadlineExtension: '2025-07-01',
      respondent1LiPResponse: {respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH}};
    provider.addInteraction({states: [{description: 'An agreed response extension can be submitted'}],
      uponReceiving: 'an agreed response extension submission',
      withRequest: {method: 'POST', path, headers, body: {event: 'INFORM_AGREED_EXTENSION_DATE_SPEC', caseDataUpdate: data}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: details(data, 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT')}});
    await provider.executeTest(async server => {
      const result = await new CivilServiceClient(server.url).submitAgreedResponseExtensionDateEvent(CASE_ID,
        {...data, respondentSolicitor1AgreedDeadlineExtension: data.respondentSolicitor1AgreedDeadlineExtension as unknown as Date}, request);
      expect(result).toMatchObject({id: CASE_ID, respondentSolicitor1AgreedDeadlineExtension: '2025-07-01', lastModifiedDate: '2025-05-01T10:00:00'});
      expect(result.claimBilingualLanguagePreference).toBe('WELSH_AND_ENGLISH');
    });
  });
});
