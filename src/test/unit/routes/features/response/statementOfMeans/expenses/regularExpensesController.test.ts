import {Request, Response} from 'express';
import regularExpensesController from '../../../../../../../main/routes/features/response/statementOfMeans/expenses/regularExpensesController';
import {CITIZEN_MONTHLY_INCOME_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Regular Expenses Controller', () => {
  const getHandler = getRouteHandler(regularExpensesController, 'get');
  const postHandler = getRouteHandler(regularExpensesController, 'post');
  const viewPath = 'features/response/statementOfMeans/expenses/regular-expenses';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const validMortgage = {
    declared: 'mortgage',
    model: {
      mortgage: {
        transactionSource: {name: 'mortgage', amount: '123.33', schedule: 'WEEK'},
      },
    },
  };

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
    it('should render the regular expenses page', async () => {
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
    it('should re-render when mortgage is selected without an amount or schedule', async () => {
      req.body = {
        declared: 'mortgage',
        model: {
          mortgage: {
            transactionSource: {name: 'mortgage', amount: '', schedule: undefined},
          },
        },
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect when no expenses are selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_INCOME_URL));
    });

    it('should save and redirect when mortgage is valid', async () => {
      req.body = validMortgage;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_INCOME_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
