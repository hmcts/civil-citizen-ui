import {Response} from 'express';
import courtProposedPlanController from 'routes/features/claimantResponse/courtProposedPlanController';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/court-proposed-plan';
const claimId = '12345';

const planClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 50,
    repaymentFrequency: TransactionSchedule.MONTH,
    firstRepaymentDate: new Date('2026-12-01'),
  };
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(courtProposedPlanController, method, CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Claimant court proposed plan Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(planClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return court proposed plan page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_RESPONSE.COURT_PROPOSED_PLAN.PAGE_TITLE',
        repaymentPlan: expect.objectContaining({paymentAmount: 50}),
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error on empty post', async () => {
      const {res} = await invoke('post', {body: {decision: null}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant response task-list if option ACCEPT_REPAYMENT_PLAN is selected', async () => {
      const {res} = await invoke('post', {body: {decision: CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to rejection reason if option JUDGE_REPAYMENT_PLAN is selected', async () => {
      const {res} = await invoke('post', {body: {decision: CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {decision: CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN}});

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render with the submitting user\'s own data when another user has loaded the page in between', async () => {
      const otherClaim = planClaim();
      otherClaim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount = 999;
      const claimsByKey: Record<string, Claim> = {'user-1-claim': planClaim(), 'user-2-claim': otherClaim};
      (generateRedisKey as jest.Mock).mockImplementation((req: AppRequest) => `${req.session.user.id}-claim`);
      (getCaseDataFromStore as jest.Mock).mockImplementation(async (key: string) => claimsByKey[key]);

      await invoke('get');
      await invoke('get', {session: createMockSession({user: {id: 'user-2'}})});
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.render.mock.calls[0][1].repaymentPlan.paymentAmount).toBe(50);
    });
  });
});
