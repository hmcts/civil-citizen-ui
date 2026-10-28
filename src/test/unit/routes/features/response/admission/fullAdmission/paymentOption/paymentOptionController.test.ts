import {Request, Response} from 'express';
import paymentOptionController from '../../../../../../../../main/routes/features/response/admission/fullAdmission/paymentOption/paymentOptionController';
import {CITIZEN_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {savePaymentOptionData} from 'services/features/response/admission/paymentOptionService';
import {createMockResponse, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/admission/paymentOptionService', () => {
  const actual = jest.requireActual('services/features/response/admission/paymentOptionService');
  return {
    ...actual,
    savePaymentOptionData: jest.fn(),
  };
});

describe('Payment Option Controller', () => {
  const getHandler = getRouteHandler(paymentOptionController, 'get');
  const postHandler = getRouteHandler(paymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockSavePaymentOptionData = savePaymentOptionData as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(stubClaim());
    mockSavePaymentOptionData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the payment option page', async () => {
      const claim = stubClaim();
      mockGetResponseClaimById.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        responseType: ResponseType.FULL_ADMISSION,
      }));
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no payment option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        responseType: ResponseType.FULL_ADMISSION,
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSavePaymentOptionData).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when IMMEDIATELY is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({paymentType: PaymentOptionType.IMMEDIATELY}),
        ResponseType.FULL_ADMISSION,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save and redirect to the task list when INSTALMENTS is selected', async () => {
      req.body = {paymentType: PaymentOptionType.INSTALMENTS};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save and redirect to the payment date page when BY_SET_DATE is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePaymentOptionData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
