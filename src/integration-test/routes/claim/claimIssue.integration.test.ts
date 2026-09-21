import request from 'supertest';
import {NextFunction} from 'express';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('../../../main/modules/draft-store/draftStoreService', () => ({
  ...jest.requireActual('../../setup/sharedMocks').draftStoreServiceMock,
  createDraftClaimInStoreWithExpiryTime: jest.fn().mockResolvedValue(undefined),
  deleteDraftClaimFromStore: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('routes/guards/checkYourAnswersGuard', () => ({
  checkYourAnswersClaimGuard: (_req: unknown, _res: unknown, next: NextFunction) => next(),
}));

jest.mock('routes/guards/pcqGuardClaim', () => ({
  isFirstTimeInPCQ: (_req: unknown, _res: unknown, next: NextFunction) => next(),
}));

import {app} from '../../../main/app';
import {
  BASE_ELIGIBILITY_URL,
  CLAIM_AMOUNT_URL,
  CLAIM_CHECK_ANSWERS_URL,
  CLAIM_COMPLETING_CLAIM_URL,
  CLAIM_CONFIRMATION_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIMANT_TASK_LIST_URL,
} from '../../../main/routes/urls';
import {civilServiceClientMock, draftStoreServiceMock} from '../../setup/sharedMocks';
import {asUser, installSessionUserInjector} from '../../setup/sessionHelper';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';

const USER_ID = 'claim-issue-user';
const SUBMITTED_CLAIM_ID = '1111222233334444';
const ELIGIBILITY_COOKIE = 'eligibilityCompleted=true';

const withUser = (userId = USER_ID): Record<string, string> => asUser(userId);

const buildDraftClaim = (): Claim => {
  const claim = new Claim();
  claim.draftClaimCreatedAt = new Date('2026-01-02T09:00:00.000Z');
  claim.draftClaimCacheTtlDays = 30;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({
      title: 'Mrs',
      firstName: 'Mary',
      lastName: 'Claimant',
    }),
  });
  claim.respondent1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({
      title: 'Mr',
      firstName: 'Joe',
      lastName: 'Defendant',
    }),
  });
  return claim;
};

const buildSubmittedClaim = (): Claim => {
  const claim = buildDraftClaim();
  claim.id = SUBMITTED_CLAIM_ID;
  claim.legacyCaseReference = '1111-2222-3333-4444';
  claim.respondent1ResponseDeadline = new Date('2026-10-01T16:00:00.000Z');
  return claim;
};

describe('Integration: claim-issue journey', () => {
  beforeAll(() => {
    installSessionUserInjector();
  });

  beforeEach(() => {
    draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(buildDraftClaim());
    draftStoreServiceMock.saveDraftClaim.mockResolvedValue(undefined);
    (civilServiceClientMock as unknown as {createDashboard: jest.Mock}).createDashboard =
      jest.fn().mockResolvedValue(undefined);
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildSubmittedClaim());
  });

  it('renders the task list for a draft claim after eligibility', async () => {
    const response = await request(app)
      .get(CLAIMANT_TASK_LIST_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Make a money claim');
    expect(response.text).toContain('Prepare your claim');
  });

  it('redirects to eligibility when there is no draft claim and no eligibility cookie', async () => {
    draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(new Claim());

    const response = await request(app)
      .get(CLAIMANT_TASK_LIST_URL)
      .set(withUser());

    expect(response.status).toBe(302);
    expect(response.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('walks completing-claim and claimant party type, then check-your-answers and submitted', async () => {
    const completingGet = await request(app)
      .get(CLAIM_COMPLETING_CLAIM_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);
    expect(completingGet.status).toBe(200);
    expect(completingGet.text).toContain('Get the details right');

    const completingPost = await request(app)
      .post(CLAIM_COMPLETING_CLAIM_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);
    expect(completingPost.status).toBe(302);
    expect(completingPost.header.location).toBe(CLAIMANT_TASK_LIST_URL);

    const partyTypeGet = await request(app)
      .get(CLAIMANT_PARTY_TYPE_SELECTION_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);
    expect(partyTypeGet.status).toBe(200);
    expect(partyTypeGet.text).toContain('About you and this claim');

    const partyTypePost = await request(app)
      .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE)
      .send({option: PartyType.INDIVIDUAL});
    expect(partyTypePost.status).toBe(302);
    expect(partyTypePost.header.location).toBe(CLAIMANT_INDIVIDUAL_DETAILS_URL);

    const amountGet = await request(app)
      .get(CLAIM_AMOUNT_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);
    expect(amountGet.status).toBe(200);
    expect(amountGet.text).toContain('Claim amount');

    const checkAnswersGet = await request(app)
      .get(CLAIM_CHECK_ANSWERS_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE);
    expect(checkAnswersGet.status).toBe(200);
    expect(checkAnswersGet.text).toContain('Check your answers');

    const submittedGet = await request(app)
      .get(CLAIM_CONFIRMATION_URL.replace(':id', SUBMITTED_CLAIM_ID))
      .set(withUser());
    expect(submittedGet.status).toBe(200);
    expect(submittedGet.text).toContain('Claim submitted');
    expect(submittedGet.text).toContain('1111-2222-3333-4444');
  });

  it('re-renders claimant party type with a validation error when no option is selected', async () => {
    const response = await request(app)
      .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
      .set(withUser())
      .set('Cookie', ELIGIBILITY_COOKIE)
      .send({});

    expect(response.status).toBe(200);
    expect(response.text).toContain('There was a problem');
    expect(response.text).toContain('Select who you are claiming as');
  });
});
