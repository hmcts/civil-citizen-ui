import {Response} from 'express';
import priorityDebtsController from '../../../../../../main/routes/features/response/statementOfMeans/priorityDebtsController';
import {CITIZEN_DEBTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {
  getPriorityDebts,
  savePriorityDebts,
} from 'services/features/response/statementOfMeans/priorityDebtsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

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
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetPriorityDebts = getPriorityDebts as jest.Mock;
  const mockSavePriorityDebts = savePriorityDebts as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;
  const errorTexts = (): string[] => renderedForm().getAllErrors()
    .map((error: {text?: string}) => error.text)
    .filter(Boolean);

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
    mockGetPriorityDebts.mockResolvedValue(PriorityDebts.buildEmptyForm());
    mockSavePriorityDebts.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetPriorityDebts.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should show errors when gas is selected but no amount or schedule selected', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'gas',
            transactionSource: {name: 'Gas', amount: ''},
          },
          electricity: {
            declared: 'electricity',
            transactionSource: {name: 'Electricity', amount: '55'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.GAS_DEBT',
        'ERRORS.EXPENSES_FREQUENCY.GAS_DEBT',
        'ERRORS.EXPENSES_FREQUENCY.ELECTRICITY_DEBT',
      ]));
    });

    it('should show errors when gas and water are selected but no amount or schedule selected', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'gas',
            transactionSource: {name: 'Gas', amount: ''},
          },
          water: {
            declared: 'water',
            transactionSource: {name: 'Water', amount: ''},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toEqual(expect.arrayContaining([
        'ERRORS.EXPENSES_AMOUNT.GAS_DEBT',
        'ERRORS.EXPENSES_FREQUENCY.GAS_DEBT',
        'ERRORS.EXPENSES_AMOUNT.WATER_DEBT',
      ]));
    });

    it('should show errors when mortgage is selected but no schedule selected', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'mortgage',
            transactionSource: {name: 'Mortgage', amount: '5129'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toContain('ERRORS.EXPENSES_FREQUENCY.MORTGAGE_DEBT');
    });

    it('should show errors when rent is selected and amount is negative', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'rent',
            transactionSource: {name: 'Rent', amount: '-5129'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toContain('ERRORS.EXPENSES_AMOUNT_FORMAT.RENT_DEBT');
    });

    it('should show errors when council tax is selected and amount has three decimal places', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'councilTax',
            transactionSource: {name: 'Council Tax or Community Charge', amount: '2000.859'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(errorTexts()).toContain('ERRORS.EXPENSES_AMOUNT_FORMAT.COUNCIL_TAX_OR_COMMUNITY_CHARGE');
    });

    it('should redirect when no data is selected', async () => {
      req.body = {model: {}};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSavePriorityDebts).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEBTS_URL));
    });

    it('should redirect when correct data is selected', async () => {
      req.body = {
        model: {
          gas: {
            declared: 'gas',
            transactionSource: {name: 'Gas', amount: '85.92', schedule: 'MONTH'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEBTS_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSavePriorityDebts.mockRejectedValue(error);
      req.body = {
        model: {
          gas: {
            declared: 'gas',
            transactionSource: {name: 'Gas', amount: '85.92', schedule: 'MONTH'},
          },
        },
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
