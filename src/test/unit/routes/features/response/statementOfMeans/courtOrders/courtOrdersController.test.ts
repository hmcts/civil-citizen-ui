import {Response} from 'express';
import courtOrdersController from '../../../../../../../main/routes/features/response/statementOfMeans/courtOrders/courtOrdersController';
import {CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {courtOrdersService} from 'services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Citizen court orders', () => {
  const getHandler = getRouteHandler(courtOrdersController, 'get');
  const postHandler = getRouteHandler(courtOrdersController, 'post');
  const viewPath = 'features/response/statementOfMeans/courtOrders/court-orders';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
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
    jest.spyOn(courtOrdersService, 'getCourtOrders').mockResolvedValue(new CourtOrders());
    jest.spyOn(courtOrdersService, 'saveCourtOrders').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render court orders page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      (courtOrdersService.getCourtOrders as jest.Mock).mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('when Yes option and one court order fully filled in, should redirect to Debts screen', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: 'abc1', amount: '120', instalmentAmount: '10'}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(courtOrdersService.saveCourtOrders).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', claimId));
    });

    it('when no option selected should re-render with an error', async () => {
      req.body = {_csrf: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('declared')).toBe('ERRORS.VALID_YES_NO_SELECTION');
    });

    it('when Yes option and an empty court order, should re-render with an error', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: '', amount: '', instalmentAmount: ''}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('when Yes option and missing court order claim number, should re-render with an error', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: '', amount: '120', instalmentAmount: '10'}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('when Yes option and missing court order claim amount, should re-render with an error', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: 'abc1', amount: '', instalmentAmount: '10'}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('when Yes option and claim number contains non-alphanumeric characters, should re-render with an error', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: 'ABC-123', amount: '120', instalmentAmount: '10'}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('when Yes option and missing court order claim instalment amount, should re-render with an error', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: 'abc1', amount: '120', instalmentAmount: ''}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      (courtOrdersService.saveCourtOrders as jest.Mock).mockRejectedValue(error);
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: 'abc1', amount: '120', instalmentAmount: '10'}],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
