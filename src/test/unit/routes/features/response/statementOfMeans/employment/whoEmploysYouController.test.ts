import {Response} from 'express';
import whoEmploysYouController from '../../../../../../../main/routes/features/response/statementOfMeans/employment/whoEmploysYouController';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_SELF_EMPLOYED_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {YesNo} from 'form/models/yesNo';
import {getEmployers, saveEmployers} from 'services/features/response/statementOfMeans/employment/employerService';
import {getEmploymentForm} from 'services/features/response/statementOfMeans/employment/employmentService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/employerService', () => ({
  getEmployers: jest.fn(),
  saveEmployers: jest.fn(),
}));
jest.mock('services/features/response/statementOfMeans/employment/employmentService', () => ({
  getEmploymentForm: jest.fn(),
  saveEmploymentData: jest.fn(),
}));

const mockEmployer = {rows: [{employerName: 'Felipe', jobTitle: 'Developer'}]};

describe('Who employs you', () => {
  const getHandler = getRouteHandler(whoEmploysYouController, 'get');
  const postHandler = getRouteHandler(whoEmploysYouController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/who-employs-you';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse> & {status: jest.Mock};
  let next: jest.Mock;
  const mockGetEmployers = getEmployers as jest.Mock;
  const mockSaveEmployers = saveEmployers as jest.Mock;
  const mockGetEmploymentForm = getEmploymentForm as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = {
      ...createMockResponse(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    mockGetEmployers.mockResolvedValue(new Employers([new Employer()]));
    mockSaveEmployers.mockResolvedValue(undefined);
    mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])));
  });

  describe('on GET', () => {
    it('should render who employs you page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render who employs you page with data from redis', async () => {
      mockGetEmployers.mockResolvedValue(new Employers([new Employer('Felipe', 'Developer')]));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetEmployers.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when form is empty', async () => {
      req.body = {rows: [{employerName: '', jobTitle: ''}]};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when jobTitle is empty', async () => {
      req.body = {rows: [{employerName: 'Test', jobTitle: ''}]};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should render error page when employment type is missing', async () => {
      mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm()));
      req.body = mockEmployer;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
    });

    it('should redirect to self-employment page when employment type is employed and self-employed', async () => {
      mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm(
        YesNo.YES,
        [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED],
      )));
      req.body = mockEmployer;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
    });

    it('should redirect to courts order page when employment type is employed', async () => {
      mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])));
      req.body = mockEmployer;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should render error page when employment type is self-employed and user is on this page', async () => {
      mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.SELF_EMPLOYED])));
      req.body = mockEmployer;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveEmployers.mockRejectedValue(error);
      req.body = mockEmployer;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
