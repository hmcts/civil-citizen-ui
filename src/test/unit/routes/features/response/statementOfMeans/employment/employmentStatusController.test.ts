import {Response} from 'express';
import employmentStatusController from '../../../../../../../main/routes/features/response/statementOfMeans/employment/employmentStatusController';
import {
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_UNEMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {YesNo} from 'form/models/yesNo';
import {
  getEmploymentForm,
  saveEmploymentData,
} from 'services/features/response/statementOfMeans/employment/employmentService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/employment/employmentService', () => ({
  getEmploymentForm: jest.fn(),
  saveEmploymentData: jest.fn(),
}));

describe('Employment status', () => {
  const getHandler = getRouteHandler(employmentStatusController, 'get');
  const postHandler = getRouteHandler(employmentStatusController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/employment-status';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetEmploymentForm = getEmploymentForm as jest.Mock;
  const mockSaveEmploymentData = saveEmploymentData as jest.Mock;
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
    mockGetEmploymentForm.mockResolvedValue(new GenericForm(new EmploymentForm()));
    mockSaveEmploymentData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render employment status page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        EmploymentCategory,
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetEmploymentForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
    });

    it('should re-render when option yes is selected but no employment type is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('employmentCategory')).toBe('ERRORS.VALID_AT_LEAST_ONE_OPTION');
    });

    it('should redirect to self-employed page when option is yes and employment type is self-employed', async () => {
      req.body = {option: YesNo.YES, employmentCategory: EmploymentCategory.SELF_EMPLOYED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
    });

    it('should redirect to employers page when option is yes and employment type is employed', async () => {
      req.body = {option: YesNo.YES, employmentCategory: EmploymentCategory.EMPLOYED};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_WHO_EMPLOYS_YOU_URL));
    });

    it('should redirect to employers page when option is yes and employment type is self-employed and employed', async () => {
      req.body = {option: YesNo.YES, employmentCategory: [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED]};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_WHO_EMPLOYS_YOU_URL));
    });

    it('should redirect to unemployed page when option is no', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_UNEMPLOYED_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveEmploymentData.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
