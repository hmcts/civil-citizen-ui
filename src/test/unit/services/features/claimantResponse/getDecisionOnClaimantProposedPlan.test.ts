import config from 'config';
import * as requestModels from 'models/AppRequest';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'models/claimantResponse';
import nock from 'nock';

import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {getClaimById} from 'modules/utilityService';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {ResponseType} from 'form/models/responseType';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const citizenBaseUrl: string = config.get('services.civilService.url');

const claim = new Claim();
claim.respondent1 = {
  partyDetails: {
    partyName: 'Mr. James Bond',
  },
  type: PartyType.INDIVIDUAL,
};
claim.respondent1.responseType= ResponseType.PART_ADMISSION;
claim.partialAdmission = new PartialAdmission();
claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100);
describe('Get Court Decision test', ()=> {
  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
    }
  });

  it('Get redirection URL when Court Decision is in Favour of Defendant and when Defendant response is SET_BY_DATE ', async () => {

    //given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate : new Date() } ;

    nock(citizenBaseUrl)
      .post('/cases/11/courtDecision')
      .reply(200, RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT);

    (getClaimById as jest.Mock).mockResolvedValueOnce(claim as any);

    //When
    const courtDecision = await getDecisionOnClaimantProposedPlan(mockedAppRequest, '11');
    //Then
    expect(courtDecision).toBe(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL);
  });

  it('Get redirection URL when Court Decision is in Favour of Defendant and when Defendant response is PAY_BY_INSTALLMENT ', async () => {

    //given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.claimantResponse = new ClaimantResponse();
    const repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: 'ONCE_ONE_WEEK',
      firstRepaymentDate: new Date(),
    };
    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.INSTALMENTS, repaymentPlan: repaymentPlan  } ;

    nock(citizenBaseUrl)
      .post('/cases/11/courtDecision')
      .reply(200, RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT);

    (getClaimById as jest.Mock).mockResolvedValueOnce(claim as any);

    //When
    const courtDecision = await getDecisionOnClaimantProposedPlan(mockedAppRequest, '11');
    //Then
    expect(courtDecision).toBe(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL);
  });

  it('Get redirection URL when Court Decision is in Favour of Claimant ', async () => {

    nock(citizenBaseUrl)
      .post('/cases/11/courtDecision')
      .reply(200, RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT);

    (getClaimById as jest.Mock).mockResolvedValueOnce(claim as any);

    //When
    const courtDecision = await getDecisionOnClaimantProposedPlan(mockedAppRequest, '11');
    //Then
    expect(courtDecision).toBe(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL);
  });

  it('Get redirection URL when Defendant is Org or Company', async () => {
    //given
    claim.respondent1 = {
      partyDetails: {
        partyName: 'Test V1',
      },
      type: PartyType.COMPANY,
    };

    (getClaimById as jest.Mock).mockResolvedValueOnce(claim as any);

    //When
    const courtDecision = await getDecisionOnClaimantProposedPlan(mockedAppRequest, '11');
    //Then
    expect(courtDecision).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
  });

});
