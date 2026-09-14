import {Response} from 'express';
import selfEmployedAsController from '../../../../../../../main/routes/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsController';
import {ON_TAX_PAYMENTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {SelfEmployedAsForm} from 'form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
} from 'services/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsService', () => ({
  getSelfEmployedAsForm: jest.fn(),
  saveSelfEmployedAsData: jest.fn(),
}));

describe('Self Employed As', () => {
  const getHandler = getRouteHandler(selfEmployedAsController, 'get');
  const postHandler = getRouteHandler(selfEmployedAsController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/selfEmployed/self-employed-as';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetSelfEmployedAsForm = getSelfEmployedAsForm as jest.Mock;
  const mockSaveSelfEmployedAsData = saveSelfEmployedAsData as jest.Mock;
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
    mockGetSelfEmployedAsForm.mockResolvedValue(new GenericForm(new SelfEmployedAsForm()));
    mockSaveSelfEmployedAsData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render on self employed page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetSelfEmployedAsForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no input text is filled', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('jobTitle')).toBe('ERRORS.JOB_TITLE_REQUIRED');
      expect(renderedForm().errorFor('annualTurnover')).toBe('ERRORS.ANNUAL_TURNOVER_REQUIRED');
    });

    it('should re-render when job title is defined and amount is not defined', async () => {
      req.body = {jobTitle: 'Developer', annualTurnover: undefined};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('annualTurnover')).toBe('ERRORS.ANNUAL_TURNOVER_REQUIRED');
    });

    it('should re-render when job title is defined and amount is -1', async () => {
      req.body = {jobTitle: 'Developer', annualTurnover: -1};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().hasErrors()).toBe(true);
    });

    it('should re-render when job title is defined and amount is 0', async () => {
      req.body = {jobTitle: 'Developer', annualTurnover: 0};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('annualTurnover')).toBe('ERRORS.ANNUAL_TURNOVER_REQUIRED');
    });

    it('should re-render when job title is defined and amount has more than two decimal places', async () => {
      req.body = {jobTitle: 'Developer', annualTurnover: 50.555};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('annualTurnover')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should re-render when job title is not defined and amount is defined', async () => {
      req.body = {jobTitle: undefined, annualTurnover: 70000};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('jobTitle')).toBe('ERRORS.JOB_TITLE_REQUIRED');
    });

    it('should redirect with valid input', async () => {
      req.body = {jobTitle: 'Developer', annualTurnover: 70000};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveSelfEmployedAsData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, ON_TAX_PAYMENTS_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveSelfEmployedAsData.mockRejectedValue(error);
      req.body = {jobTitle: 'Developer', annualTurnover: 70000};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
