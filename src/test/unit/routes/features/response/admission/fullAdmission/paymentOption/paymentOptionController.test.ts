import {Response} from 'express';
import paymentOptionController from '../../../../../../../../main/routes/features/response/admission/fullAdmission/paymentOption/paymentOptionController';
import {
  CITIZEN_PAYMENT_DATE_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {PaymentOption} from 'form/models/admission/paymentOption/paymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {getPaymentOptionForm, savePaymentOptionData} from 'services/features/response/admission/paymentOptionService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/admission/paymentOptionService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');

describe('Payment Option Controller', () => {
  const getHandler = getRouteHandler(paymentOptionController, 'get');
  const postHandler = getRouteHandler(paymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetPaymentOptionForm = getPaymentOptionForm as jest.Mock;
  const mockSavePaymentOptionData = savePaymentOptionData as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetClaimById.mockResolvedValue(new Claim());
    mockGetPaymentOptionForm.mockResolvedValue(new PaymentOption(undefined, 0));
    mockSavePaymentOptionData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render payment option page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        responseType: ResponseType.FULL_ADMISSION,
        claim: expect.any(Claim),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        responseType: ResponseType.FULL_ADMISSION,
      }));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('paymentType')).toBe('ERRORS.VALID_PAYMENT_OPTION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to task list when immediately option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalledWith(claimId, expect.any(PaymentOption), ResponseType.FULL_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to task list when instalments option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to payment date when by set date option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSavePaymentOptionData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
