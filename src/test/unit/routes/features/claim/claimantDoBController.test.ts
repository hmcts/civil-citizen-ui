import {Response} from 'express';
import claimantDoBController from '../../../../../main/routes/features/claim/yourDetails/claimantDoBController';
import {CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Party} from 'models/party';
import {DOBDate} from 'common/form/models/claim/claimant/dobDate';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/claimantDetailsService', () => ({
  getClaimantInformation: jest.fn(),
  saveClaimantProperty: jest.fn(),
}));

describe('Claimant Date of Birth Controller', () => {
  const getHandler = getRouteHandler(claimantDoBController, 'get');
  const postHandler = getRouteHandler(claimantDoBController, 'post');
  const viewPath = 'features/response/citizenDob/citizen-dob';
  const pageTitle = 'PAGES.CLAIMANT_DOB.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimantInformation = getClaimantInformation as jest.Mock;
  const mockSaveClaimantProperty = saveClaimantProperty as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimantInformation.mockResolvedValue(new Party());
    mockSaveClaimantProperty.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render date of birth page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        claimantView: true,
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.day).not.toBe(NaN);
    });

    it('should render date of birth page with applicant values', async () => {
      mockGetClaimantInformation.mockResolvedValue(new Party());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.day).not.toBe(NaN);
    });

    it('should render saved date of birth values', async () => {
      const claimant = new Party();
      claimant.dateOfBirth = new DOBDate('2', '3', '1980');
      mockGetClaimantInformation.mockResolvedValue(claimant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect(form.model.day).toBe(2);
      expect(form.model.month).toBe(3);
      expect(form.model.year).toBe(1980);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetClaimantInformation.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render date of birth page if there are form errors', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when claimant is under 18', async () => {
      const today = new Date();
      req.body = {day: today.getDate(), month: today.getMonth(), year: today.getFullYear() - 16};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant phone number page', async () => {
      req.body = {day: 2, month: 3, year: 1980};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimantProperty).toHaveBeenCalledWith(req, 'dateOfBirth', expect.any(DOBDate));
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_PHONE_NUMBER_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimantProperty.mockRejectedValue(error);
      req.body = {day: 4, month: 5, year: 1952};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
