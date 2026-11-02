import {Request, Response} from 'express';
import debtsController from '../../../../../../../main/routes/features/response/statementOfMeans/debts/debtsController';
import {CITIZEN_MONTHLY_EXPENSES_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {
  buildDebtFormNo,
  buildDebtFormUndefined,
  buildDebtFormYes,
  buildDebtFormYesWithoutItems,
} from '../../../../../../utils/mockForm';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Debts', () => {
  const getHandler = getRouteHandler(debtsController, 'get');
  const postHandler = getRouteHandler(debtsController, 'post');
  const viewPath = 'features/response/statementOfMeans/debts/debts';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the debts page', async () => {
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
    it('should re-render when no option is selected', async () => {
      req.body = buildDebtFormUndefined();

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when yes is selected and no debt is entered', async () => {
      req.body = buildDebtFormYesWithoutItems();

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect when yes is selected', async () => {
      req.body = buildDebtFormYes();

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should save and redirect when no is selected', async () => {
      req.body = buildDebtFormNo();

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = buildDebtFormYes();

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
