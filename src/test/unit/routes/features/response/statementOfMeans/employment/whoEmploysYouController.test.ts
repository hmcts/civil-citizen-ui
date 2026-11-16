import {Request, Response} from 'express';
import whoEmploysYouController from '../../../../../../../main/routes/features/response/statementOfMeans/employment/whoEmploysYouController';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_SELF_EMPLOYED_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Who employs you', () => {
  const getHandler = getRouteHandler(whoEmploysYouController, 'get');
  const postHandler = getRouteHandler(whoEmploysYouController, 'post');
  const viewPath = 'features/response/statementOfMeans/employment/who-employs-you';
  const claimId = '12345';
  const employer = {rows: [{employerName: 'Felipe', jobTitle: 'Developer'}]};
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse> & {status: jest.Mock};
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const claimWithEmployment = (employmentType: EmploymentCategory[]): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.employment = {declared: true, employmentType};
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = Object.assign(createMockResponse(), {status: jest.fn()});
    res.status.mockReturnValue(res);
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
    res.status.mockReturnValue(res);
  });

  describe('on GET', () => {
    it('should render the who employs you page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no employer is entered', async () => {
      req.body = {rows: [{employerName: '', jobTitle: ''}]};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the job title is missing', async () => {
      req.body = {rows: [{employerName: 'Test', jobTitle: ''}]};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to court orders when the defendant is employed', async () => {
      mockGetCaseData.mockResolvedValue(claimWithEmployment([EmploymentCategory.EMPLOYED]));
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
    });

    it('should redirect to self-employment when the defendant is employed and self-employed', async () => {
      mockGetCaseData.mockResolvedValue(claimWithEmployment([EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED]));
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
    });

    it('should render an error when the stored employment is self-employed only', async () => {
      mockGetCaseData.mockResolvedValue(claimWithEmployment([EmploymentCategory.SELF_EMPLOYED]));
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('error');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = employer;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
