import {Request, Response} from 'express';
import whoEmploysYouController from '../../../../../../../main/routes/features/response/statementOfMeans/employment/whoEmploysYouController';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_SELF_EMPLOYED_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {YesNo} from 'form/models/yesNo';
import * as employerService from 'services/features/response/statementOfMeans/employment/employerService';
import * as employmentService from 'services/features/response/statementOfMeans/employment/employmentService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/employerService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/employment/employerService');
  return {
    ...actual,
    getEmployers: jest.fn(),
    saveEmployers: jest.fn(),
  };
});
jest.mock('services/features/response/statementOfMeans/employment/employmentService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/employment/employmentService');
  return {
    ...actual,
    getEmploymentForm: jest.fn(),
  };
});

describe('Who employs you', () => {
  const getHandler = getRouteHandler(whoEmploysYouController, 'get');
  const postHandler = getRouteHandler(whoEmploysYouController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/who-employs-you';
  const claimId = '12345';
  const employer = {rows: [{employerName: 'Felipe', jobTitle: 'Developer'}]};
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse> & {status: jest.Mock};
  let next: jest.Mock;
  const mockGetEmployers = employerService.getEmployers as jest.Mock;
  const mockSaveEmployers = employerService.saveEmployers as jest.Mock;
  const mockGetEmploymentForm = employmentService.getEmploymentForm as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = Object.assign(createMockResponse(), {status: jest.fn()});
    res.status.mockReturnValue(res);
    next = jest.fn();
    jest.clearAllMocks();
    mockGetEmployers.mockResolvedValue(new Employers([new Employer()]));
    mockSaveEmployers.mockResolvedValue(undefined);
    mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])));
  });

  describe('on GET', () => {
    it('should render the who employs you page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetEmployers).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetEmployers.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no employer is entered', async () => {
      req.body = {rows: [{employerName: '', jobTitle: ''}]};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveEmployers).not.toHaveBeenCalled();
    });

    it('should re-render when the job title is missing', async () => {
      req.body = {rows: [{employerName: 'Test', jobTitle: ''}]};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to court orders when the defendant is employed', async () => {
      mockGetEmploymentForm.mockResolvedValue(
        new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])),
      );
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveEmployers).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should redirect to self-employment when the defendant is employed and self-employed', async () => {
      mockGetEmploymentForm.mockResolvedValue(
        new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED])),
      );
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
    });

    it('should render an error when the stored employment is self-employed only', async () => {
      mockGetEmploymentForm.mockResolvedValue(
        new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.SELF_EMPLOYED])),
      );
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveEmployers.mockRejectedValue(error);
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
