import request from 'supertest';
import {NextFunction} from 'express';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('../../../main/modules/draft-store/draftStoreService', () =>
  jest.requireActual('../../setup/sharedMocks').draftStoreServiceMock,
);

jest.mock('../../../main/modules/draft-store/draftStoreDbService', () => ({
  ...jest.requireActual('../../../main/modules/draft-store/draftStoreDbService'),
  getActiveDraftFromDraftStoreDb: jest.fn().mockResolvedValue(null),
  getDraftForCaseFromDraftStoreDb: jest.fn().mockResolvedValue(null),
  createOrLoadDraftClaimInDraftStoreDb: jest.fn(),
  updateDraftClaimInStore: jest.fn(),
  applyPaymentRetentionInDraftStoreDb: jest.fn(),
  deleteDraftClaimFromStore: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  ...jest.requireActual('modules/draft-store/paymentSessionStoreService'),
  saveUserId: jest.fn().mockResolvedValue(undefined),
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
  CLAIM_FEE_BREAKUP,
  CLAIM_FEE_PAYMENT_CONFIRMATION_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIMANT_TASK_LIST_URL,
} from '../../../main/routes/urls';
import {civilServiceClientMock, draftStoreServiceMock, paymentServiceMock} from '../../setup/sharedMocks';
import {getActiveDraftFromDraftStoreDb} from '../../../main/modules/draft-store/draftStoreDbService';
import {asUser, installSessionUserInjector} from '../../setup/sessionHelper';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {FeeType} from '../../../main/common/form/models/helpWithFees/feeType';
import {BusinessProcess} from '../../../main/common/models/businessProcess';
import {toCUIClaimDetails} from '../../../main/services/translation/convertToCUI/convertToCUIClaimDetails';
import {saveUserId} from '../../../main/modules/draft-store/paymentSessionStoreService';
import {t} from 'i18next';
import {JSDOM} from 'jsdom';

const mockGetActiveDraftFromDb = getActiveDraftFromDraftStoreDb as jest.MockedFunction<
  typeof getActiveDraftFromDraftStoreDb
>;

const USER_ID = 'claim-issue-user';
const SUBMITTED_CLAIM_ID = '1111222233334444';
const ELIGIBILITY_COOKIE = 'eligibilityCompleted=true';

const withUser = (userId = USER_ID): Record<string, string> => asUser(userId);

const asStoredDraft = (claim: Claim) => ({
  id: 'draft-123',
  case_data: claim,
});

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
    draftStoreServiceMock.getDraftClaimFromStore.mockResolvedValue(asStoredDraft(buildDraftClaim()));
    draftStoreServiceMock.saveDraftClaim.mockResolvedValue(undefined);
    mockGetActiveDraftFromDb.mockResolvedValue(null);
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
    draftStoreServiceMock.getDraftClaimFromStore.mockResolvedValue({id: 'draft-123'});

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

  describe('payment redirects after CCD rehydration', () => {
    const paymentReference = 'RC-1234-1234-1234-1234';
    const feeUrl = CLAIM_FEE_BREAKUP.replace(':id', SUBMITTED_CLAIM_ID);
    const paymentUrl = 'https://card.payments.service.gov.uk/secure/next';
    let paymentClaim: Claim;
    let savedClaims: Claim[];

    beforeEach(() => {
      paymentClaim = buildSubmittedClaim();
      paymentClaim.ccdState = CaseState.PENDING_CASE_ISSUED;
      paymentClaim.claimInterest = YesNo.NO;
      paymentClaim.claimFee = {calculatedAmountInPence: 10000, code: 'test-fee', version: 1};
      paymentClaim.businessProcess = Object.assign(new BusinessProcess(), {status: 'FINISHED'});
      // The real translator restores the reference/status but has no provider nextUrl.
      paymentClaim.claimDetails = toCUIClaimDetails({
        claimIssuedPaymentDetails: {reference: paymentReference, status: 'Initiated'},
      });
      savedClaims = [];
      draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(paymentClaim);
      draftStoreServiceMock.getDraftClaimFromStore.mockResolvedValue(asStoredDraft(paymentClaim));
      draftStoreServiceMock.saveDraftClaim.mockImplementation(async (_key: string, claim: Claim) => {
        savedClaims.push(JSON.parse(JSON.stringify(claim)));
      });
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(paymentClaim);
      paymentServiceMock.getFeePaymentStatus.mockReset().mockResolvedValue({status: 'Initiated'});
      paymentServiceMock.getFeePaymentRedirectInformation.mockReset();
    });

    afterEach(() => {
      draftStoreServiceMock.saveDraftClaim.mockReset().mockResolvedValue(undefined);
      paymentServiceMock.getFeePaymentStatus.mockReset();
      paymentServiceMock.getFeePaymentRedirectInformation.mockReset();
    });

    it.each(['pending', 'status lookup failure'])('recovers a translated payment with no URL after %s', async scenario => {
      const expectedClaim = JSON.parse(JSON.stringify(paymentClaim));
      expect(paymentClaim.claimDetails.claimFeePayment.nextUrl).toBeUndefined();
      if (scenario === 'status lookup failure') {
        paymentServiceMock.getFeePaymentStatus.mockRejectedValue(new Error('status unavailable'));
      }

      const response = await request(app).post(feeUrl).set(withUser()).set('Cookie', ELIGIBILITY_COOKIE);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(feeUrl);
      expect(paymentServiceMock.getFeePaymentRedirectInformation).not.toHaveBeenCalled();
      expect(paymentServiceMock.getFeePaymentStatus).toHaveBeenCalledTimes(1);
      expect(paymentServiceMock.getFeePaymentStatus).toHaveBeenCalledWith(
        SUBMITTED_CLAIM_ID, paymentReference, FeeType.CLAIMISSUED,
        expect.objectContaining({session: expect.objectContaining({user: expect.objectContaining({id: USER_ID})})}),
      );
      expect(saveUserId).toHaveBeenCalledTimes(1);
      expect(saveUserId).toHaveBeenCalledWith(SUBMITTED_CLAIM_ID, FeeType.CLAIMISSUED, USER_ID);
      expect(draftStoreServiceMock.saveDraftClaim).toHaveBeenCalledTimes(1);
      expect(draftStoreServiceMock.saveDraftClaim).toHaveBeenCalledWith('test-redis-key', paymentClaim, true, USER_ID);
      expect(savedClaims).toEqual([expectedClaim]);

      const recovery = await request(app).get(response.header.location).set(withUser()).set('Cookie', ELIGIBILITY_COOKIE);
      expect(recovery.status).toBe(200);
      expect(recovery.text).toContain(t('PAGES.FEE_AMOUNT.TITLE'));
      const payButton = JSDOM.fragment(recovery.text).querySelector<HTMLButtonElement>('form button[type="submit"]');
      expect(payButton?.textContent.trim()).toBe(t('PAGES.FEE_AMOUNT.CONTINUE_TO_PAYMENT') + '(£100)');
      expect(payButton?.disabled).toBe(false);
    });

    it('preserves successful payment confirmation without a provider URL', async () => {
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Success'});

      const response = await request(app).post(feeUrl).set(withUser()).set('Cookie', ELIGIBILITY_COOKIE);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(CLAIM_FEE_PAYMENT_CONFIRMATION_URL.replace(':id', SUBMITTED_CLAIM_ID));
      expect(paymentServiceMock.getFeePaymentRedirectInformation).not.toHaveBeenCalled();
    });

    it('preserves an existing provider URL for a pending payment', async () => {
      paymentClaim.claimDetails.claimFeePayment.nextUrl = paymentUrl;

      const response = await request(app).post(feeUrl).set(withUser()).set('Cookie', ELIGIBILITY_COOKIE);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(paymentUrl);
      expect(paymentServiceMock.getFeePaymentRedirectInformation).not.toHaveBeenCalled();
    });
  });
});
