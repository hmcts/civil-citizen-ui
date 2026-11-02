import {Request, Response} from 'express';
import courtOrdersController from '../../../../../../../main/routes/features/response/statementOfMeans/courtOrders/courtOrdersController';
import {CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {courtOrdersService} from 'services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Citizen court orders', () => {
  const getHandler = getRouteHandler(courtOrdersController, 'get');
  const postHandler = getRouteHandler(courtOrdersController, 'post');
  const viewPath = 'features/response/statementOfMeans/courtOrders/court-orders';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetCourtOrders: jest.SpyInstance;
  let mockSaveCourtOrders: jest.SpyInstance;

  const validCourtOrder = {
    declared: 'yes',
    rows: [{claimNumber: 'abc1', amount: '120', instalmentAmount: '10'}],
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetCourtOrders = jest.spyOn(courtOrdersService, 'getCourtOrders')
      .mockResolvedValue(new CourtOrders());
    mockSaveCourtOrders = jest.spyOn(courtOrdersService, 'saveCourtOrders')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the court orders page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetCourtOrders).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetCourtOrders.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveCourtOrders).not.toHaveBeenCalled();
    });

    it('should re-render when yes is selected and the court order is empty', async () => {
      req.body = {
        declared: 'yes',
        rows: [{claimNumber: '', amount: '', instalmentAmount: ''}],
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect when yes and a court order are provided', async () => {
      req.body = validCourtOrder;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveCourtOrders).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PRIORITY_DEBTS_URL));
    });

    it('should save and redirect when no is selected', async () => {
      req.body = {declared: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveCourtOrders).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({declared: false}),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PRIORITY_DEBTS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveCourtOrders.mockRejectedValue(error);
      req.body = validCourtOrder;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
