import {Response} from 'express';
import unemploymentController from '../../../../../../../main/routes/features/response/statementOfMeans/unemployment/unemploymentController';
import {CITIZEN_COURT_ORDERS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';
import {UnemploymentService} from 'services/features/response/statementOfMeans/unemployment/unemploymentService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Unemployment', () => {
  const getHandler = getRouteHandler(unemploymentController, 'get');
  const postHandler = getRouteHandler(unemploymentController, 'post');
  const viewPath = 'features/response/statementOfMeans/unemployment';
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
    jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockResolvedValue(new Unemployment());
    jest.spyOn(UnemploymentService.prototype, 'saveUnemployment').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render unemployment page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        UnemploymentCategory,
      }));
    });

    it('should render unemployment page successfully without statement of means', async () => {
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockResolvedValue(new Unemployment());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when claim is missing', async () => {
      const error = new Error('error');
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should render unemployment page successfully without unemployment', async () => {
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockResolvedValue(new Unemployment());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render unemployment page successfully when retired', async () => {
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockResolvedValue(new Unemployment(UnemploymentCategory.RETIRED));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render unemployment page successfully when other', async () => {
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockResolvedValue(new Unemployment(
        UnemploymentCategory.OTHER,
        undefined,
        new OtherDetails('Test'),
      ));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      jest.spyOn(UnemploymentService.prototype, 'getUnemployment').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should redirect to court page when Retired is selected and without statement of means', async () => {
      req.body = {option: UnemploymentCategory.RETIRED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should redirect to court page when Retired is selected', async () => {
      req.body = {option: UnemploymentCategory.RETIRED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(UnemploymentService.prototype.saveUnemployment).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should call next when Retired is selected without claim data', async () => {
      const error = new Error('error');
      jest.spyOn(UnemploymentService.prototype, 'saveUnemployment').mockRejectedValue(error);
      req.body = {option: UnemploymentCategory.RETIRED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render when option Other is selected and detail is empty', async () => {
      req.body = {option: UnemploymentCategory.OTHER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should redirect when option Other is selected and detail is provided', async () => {
      req.body = {option: UnemploymentCategory.OTHER, details: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should redirect when option Unemployed is selected and has year and month', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '5', months: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should re-render when option Unemployed is selected and year and month are empty', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when option Unemployed is selected and year is greater than 80', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '150', months: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when option Unemployed is selected and month is greater than 11', async () => {
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '1', months: '12'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(UnemploymentService.prototype, 'saveUnemployment').mockRejectedValue(error);
      req.body = {option: UnemploymentCategory.UNEMPLOYED, years: '1', months: '11'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
