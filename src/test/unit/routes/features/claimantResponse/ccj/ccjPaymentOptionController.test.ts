import {Response} from 'express';
import ccjPaymentOptionController from 'routes/features/claimantResponse/ccj/ccjPaymentOptionController';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_DEFENDANT_PAYMENT_DATE_URL,
  CCJ_PAYMENT_OPTIONS_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/ccj/ccj-payment-options';
const claimId = '12345';

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(ccjPaymentOptionController, method, CCJ_PAYMENT_OPTIONS_URL)(
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

describe('CCJ - Payment option', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return ccj payment option', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_PAYMENT_TYPE.PAGE_TITLE',
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should validate when option is not selected', async () => {
      const {res} = await invoke('post', {body: {}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to check and send page when immediately option is selected', async () => {
      const {res} = await invoke('post', {body: {type: PaymentOptionType.IMMEDIATELY}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
    });

    it('should redirect to repayment plan page when instalments option is selected', async () => {
      const {res} = await invoke('post', {body: {type: PaymentOptionType.INSTALMENTS}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_REPAYMENT_PLAN_INSTALMENTS_URL));
    });

    it('should redirect to by set date page when by set date option is selected', async () => {
      const {res} = await invoke('post', {body: {type: PaymentOptionType.BY_SET_DATE}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_DEFENDANT_PAYMENT_DATE_URL));
    });

    it('should return 500 status when there is error', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {type: PaymentOptionType.BY_SET_DATE}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
