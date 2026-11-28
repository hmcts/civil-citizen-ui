import {Request, Response} from 'express';
import unemploymentController from '../../../../../../../main/routes/features/response/statementOfMeans/unemployment/unemploymentController';
import {CITIZEN_COURT_ORDERS_URL} from 'routes/urls';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {UnemploymentService} from 'services/features/response/statementOfMeans/unemployment/unemploymentService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Unemployment', () => {
  const getHandler = getRouteHandler(unemploymentController, 'get');
  const postHandler = getRouteHandler(unemploymentController, 'post');
  const viewPath = 'features/response/statementOfMeans/unemployment';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetUnemployment: jest.SpyInstance;
  let mockSaveUnemployment: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetUnemployment = jest.spyOn(UnemploymentService.prototype, 'getUnemployment')
      .mockResolvedValue(new Unemployment());
    mockSaveUnemployment = jest.spyOn(UnemploymentService.prototype, 'saveUnemployment')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the unemployment page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetUnemployment).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        UnemploymentCategory,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetUnemployment.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveUnemployment).not.toHaveBeenCalled();
    });

    it('should re-render when other is selected without details', async () => {
      req.body = {option: UnemploymentCategory.OTHER};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when unemployed is selected without a length of time', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect when retired is selected', async () => {
      req.body = {option: UnemploymentCategory.RETIRED};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveUnemployment).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should save and redirect when other is selected with details', async () => {
      req.body = {option: UnemploymentCategory.OTHER, details: 'Test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveUnemployment).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should save and redirect when unemployed is selected with years and months', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '5', months: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveUnemployment).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveUnemployment.mockRejectedValue(error);
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '1', months: '11'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
