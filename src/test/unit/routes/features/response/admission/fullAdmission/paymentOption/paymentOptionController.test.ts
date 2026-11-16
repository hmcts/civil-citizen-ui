import {Request, Response} from 'express';
import paymentOptionController from '../../../../../../../../main/routes/features/response/admission/fullAdmission/paymentOption/paymentOptionController';
import {CITIZEN_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');

describe('Payment Option Controller', () => {
  const getHandler = getRouteHandler(paymentOptionController, 'get');
  const postHandler = getRouteHandler(paymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetClaimById = utilityService.getClaimById as jest.Mock;

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
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaimById.mockResolvedValue(stubClaim());
  });

  describe('on GET', () => {
    it('should render the payment option page', async () => {
      const claim = stubClaim();
      mockGetClaimById.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        responseType: ResponseType.FULL_ADMISSION,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

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
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when IMMEDIATELY is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save and redirect to the task list when INSTALMENTS is selected', async () => {
      req.body = {paymentType: PaymentOptionType.INSTALMENTS};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save and redirect to the payment date page when BY_SET_DATE is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
