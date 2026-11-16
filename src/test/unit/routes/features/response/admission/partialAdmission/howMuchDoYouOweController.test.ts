import {Request, Response} from 'express';
import howMuchDoYouOweController from '../../../../../../../main/routes/features/response/admission/partialAdmission/howMuchDoYouOweController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Partial Admit - How much money do you admit you owe? Controller', () => {
  const getHandler = getRouteHandler(howMuchDoYouOweController, 'get');
  const postHandler = getRouteHandler(howMuchDoYouOweController, 'post');
  const viewPath = 'features/response/admission/partialAdmission/how-much-do-you-owe';
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
    claim.totalClaimAmount = 110;
    return claim;
  };

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
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
    it('should render the how much do you owe page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
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
    it('should re-render when no amount is provided', async () => {
      req.body = {amount: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when amount 0 is provided', async () => {
      req.body = {amount: 0};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when more than 2 decimals are provided', async () => {
      req.body = {amount: 10.123};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when a negative amount is provided', async () => {
      req.body = {amount: -110};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when a non-numeric amount is provided', async () => {
      req.body = {amount: 'abc'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the amount is bigger than the claim amount', async () => {
      req.body = {amount: 9999999999999};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the amount is the claim amount plus 1', async () => {
      req.body = {amount: 111};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should save and redirect to the task list when a valid amount is provided', async () => {
      req.body = {amount: 100};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {amount: 200};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
