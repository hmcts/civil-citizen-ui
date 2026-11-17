import {Response} from 'express';
import acceptRepaymentPlanController from 'routes/features/claimantResponse/acceptRepaymentPlanController';
import {CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/accept-repayment-plan';
const claimId = '12345';
const taskListUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);

const planClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.respondent1.partyDetails = {firstName: 'John', lastName: 'White'} as unknown as Party['partyDetails'];
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
  claim.partialAdmission.paymentIntention.paymentDate = new Date('2026-12-01');
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: TransactionSchedule.MONTH,
    firstRepaymentDate: new Date('2026-12-01'),
  };
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(acceptRepaymentPlanController, method, CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL)(
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

describe('Accept Repayment Plan Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(planClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return accept repayment plan page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.ACCEPT_REPAYMENT_PLAN.PAGE_TITLE',
        defendantName: 'John White',
      }));
    });

    it('should return 500 status code when error occurs', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to task list when yes is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.YES}), 'fullAdmitSetDateAcceptPayment');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should redirect to task list when no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.NO}), 'fullAdmitSetDateAcceptPayment');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should return error when no option selected', async () => {
      const {res} = await invoke('post', {body: {option: undefined}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should return 500 status code when error occurs', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.NO}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
