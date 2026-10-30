import {Response} from 'express';
import paidAmountController from 'routes/features/claimantResponse/ccj/paidAmountController';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CCJ_EXTENDED_PAID_AMOUNT_URL,
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAID_AMOUNT_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const viewPath = 'features/claimantResponse/ccj/paid-amount';
const claimId = '12345';

const amountClaim = (totalClaimAmount: number): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = totalClaimAmount;
  return claim;
};

const invoke = async (method: 'get' | 'post', url: string, req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(paidAmountController, method, url)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      url,
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const expectErrors = (res: ReturnType<typeof createMockResponse>) => {
  expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
    pageTitle: 'PAGES.CCJ_PAID_AMOUNT.PAGE_TITLE',
  }));
  expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
  expect(res.redirect).not.toHaveBeenCalled();
};

describe('CCJ - Paid amount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(amountClaim(110));
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(amountClaim(110));
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Paid amount page', async () => {
      const {res} = await invoke('get', CCJ_PAID_AMOUNT_URL);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_PAID_AMOUNT.PAGE_TITLE',
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get', CCJ_PAID_AMOUNT_URL);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET from task-list', () => {
    it('should return Paid amount page from task-list', async () => {
      const {res} = await invoke('get', CCJ_EXTENDED_PAID_AMOUNT_URL);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_PAID_AMOUNT.PAGE_TITLE',
      }));
    });

    it('should return status 500 when error thrown from task-list', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get', CCJ_EXTENDED_PAID_AMOUNT_URL);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error on empty post', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL);

      expectErrors(res);
    });

    it('should return error on empty already paid amount', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: ''}});

      expectErrors(res);
    });

    it('should return error maximum 2 decimal', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: '100.455'}});

      expectErrors(res);
    });

    it('should return error with amount greater then the claimed amount', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: '5555'}});

      expectErrors(res);
    });

    it('should return error with equal amount with the claimed amount', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: '110'}});

      expectErrors(res);
    });

    it('should re-render when option yes is selected because part payment is unavailable', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: '10'}});

      expectErrors(res);
    });

    it('should redirect to paid amount summary page if option no is selected', async () => {
      const {res} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.NO}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_SUMMARY_URL));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', CCJ_PAID_AMOUNT_URL, {body: {option: YesNo.NO}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST from task-list', () => {
    it('(FROM TASK-LIST) should re-render when option yes is selected', async () => {
      const {res} = await invoke('post', CCJ_EXTENDED_PAID_AMOUNT_URL, {body: {option: YesNo.YES, amount: '10'}});

      expectErrors(res);
    });

    it('(FROM TASK-LIST) should redirect to paid amount summary page if option no is selected', async () => {
      const {res} = await invoke('post', CCJ_EXTENDED_PAID_AMOUNT_URL, {body: {option: YesNo.NO}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL));
    });
  });
});
