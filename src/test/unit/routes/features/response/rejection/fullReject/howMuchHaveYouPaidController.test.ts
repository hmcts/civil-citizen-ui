import {Response} from 'express';
import howMuchHaveYouPaidController from 'routes/features/response/admission/fullRejection/howMuchHaveYouPaidController';
import {
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/admission/how-much-have-you-paid';
const claimId = '12345';
const validPayment = {amount: 20, year: '2022', month: '1', day: '1', text: 'text'};

const claimWithTotal = (totalClaimAmount?: number, paid?: HowMuchHaveYouPaid): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = totalClaimAmount;
  if (paid) {
    claim.rejectAllOfClaim = new RejectAllOfClaim(undefined, paid);
  }
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(howMuchHaveYouPaidController, method, CITIZEN_FR_AMOUNT_YOU_PAID_URL)(
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

describe('How Much Have You Paid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithTotal(110));
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render an empty payment form with the claim total', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        totalClaimAmount: 110,
      }));
      expect(res.render.mock.calls[0][1].form.model.amount).toBeUndefined();
    });

    it('should load the payment stored on the claim', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithTotal(110, new HowMuchHaveYouPaid({
        amount: 20,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '1',
        text: 'text',
      })));

      const {res} = await invoke('get');

      expect(res.render.mock.calls[0][1].form.model.amount).toBe(20);
      expect(res.render.mock.calls[0][1].form.model.year).toBe(2022);
      expect(res.render.mock.calls[0][1].form.model.month).toBe(1);
      expect(res.render.mock.calls[0][1].form.model.day).toBe(1);
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the payment is blank', async () => {
      await invoke('get');

      const {res} = await invoke('post', {body: {}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to you have paid less when the amount is below the claim total', async () => {
      await invoke('get');

      const {res} = await invoke('post', {body: validPayment});

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL),
      );
    });

    it('should redirect to the task list when the amount is not below the claim total', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithTotal());
      await invoke('get');

      const {res} = await invoke('post', {body: {...validPayment, amount: 50}});

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when saving the payment fails', async () => {
      const error = new Error('redis failure');
      await invoke('get');
      (saveDraftClaim as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: validPayment});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
