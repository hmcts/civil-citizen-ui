import {Request, Response} from 'express';
import paymentDateController from '../../../../../../../main/routes/features/response/admission/partialAdmission/paymentDateController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Payment date', () => {
  const getHandler = getRouteHandler(paymentDateController, 'get');
  const postHandler = getRouteHandler(paymentDateController, 'post');
  const viewPath = 'features/response/admission/payment-date';
  const title = 'PAGES.ADMISSION_PAYMENT_DATE.TITLE';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    return claim;
  };

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
      title,
    }));
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the payment date page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        title,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no date is provided', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the date is in the past', async () => {
      req.body = {year: '1999', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the year is missing', async () => {
      req.body = {year: '', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should save and redirect to the task list for a valid future date', async () => {
      req.body = {year: '9999', month: '1', day: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {year: '9999', month: '12', day: '31'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
