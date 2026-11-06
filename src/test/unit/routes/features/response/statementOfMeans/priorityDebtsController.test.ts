import {Request, Response} from 'express';
import priorityDebtsController from '../../../../../../main/routes/features/response/statementOfMeans/priorityDebtsController';
import {CITIZEN_DEBTS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import * as priorityDebtsService from 'services/features/response/statementOfMeans/priorityDebtsService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/priorityDebtsService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/priorityDebtsService');
  return {
    ...actual,
    getPriorityDebts: jest.fn(),
    savePriorityDebts: jest.fn(),
  };
});

describe('Priority Debts Controller', () => {
  const getHandler = getRouteHandler(priorityDebtsController, 'get');
  const postHandler = getRouteHandler(priorityDebtsController, 'post');
  const viewPath = 'features/response/statementOfMeans/priority-debts';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetPriorityDebts = priorityDebtsService.getPriorityDebts as jest.Mock;
  const mockSavePriorityDebts = priorityDebtsService.savePriorityDebts as jest.Mock;

  const validGasDebt = {
    model: {
      gas: {
        declared: 'gas',
        transactionSource: {name: 'Gas', amount: '85.92', schedule: 'MONTH'},
      },
    },
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetPriorityDebts.mockResolvedValue(PriorityDebts.buildEmptyForm());
    mockSavePriorityDebts.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the priority debts page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetPriorityDebts).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetPriorityDebts.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when a debt is selected without an amount or schedule', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'gas',
            transactionSource: {name: 'Gas', amount: ''},
          },
        },
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSavePriorityDebts).not.toHaveBeenCalled();
    });

    it('should save and redirect when no debts are selected', async () => {
      req.body = {model: {}};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePriorityDebts).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEBTS_URL));
    });

    it('should save and redirect when a debt is valid', async () => {
      req.body = validGasDebt;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePriorityDebts).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEBTS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePriorityDebts.mockRejectedValue(error);
      req.body = validGasDebt;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
