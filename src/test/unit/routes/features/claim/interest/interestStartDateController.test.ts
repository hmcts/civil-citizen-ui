import {Response} from 'express';
import interestStartDateController from '../../../../../../main/routes/features/claim/interest/interestStartDateController';
import {CLAIM_INTEREST_END_DATE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('interest start date', () => {
  const getHandler = getRouteHandler(interestStartDateController, 'get');
  const postHandler = getRouteHandler(interestStartDateController, 'post');
  const viewPath = 'features/claim/interest/interest-start-date';
  const pageTitle = 'PAGES.INTEREST_START_DATE.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetInterest = getInterest as jest.Mock;
  const mockSaveInterest = saveInterest as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetInterest.mockResolvedValue(new Interest());
    mockSaveInterest.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render interest start date page empty when there is no information', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
        today: expect.any(Date),
      }));
    });

    it('should call next when get fails', async () => {
      const error = new Error('error');
      mockGetInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

    it('should save and redirect when redis gives undefined', async () => {
      req.body = {year: '2000', month: '1', day: '1', reason: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_END_DATE_URL);
    });

    it('should re-render with errors on no input', async () => {
      req.body = {year: '', month: '', day: '', reason: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('year')).toBeTruthy();
      expect(renderedForm().errorFor('reason')).toBe('ERRORS.VALID_WHY_FROM_PARTICULAR_DATE');
    });

    it('should re-render with error on year less than 1872', async () => {
      req.body = {year: '1871', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });

    it('should re-render with error on empty year', async () => {
      req.body = {year: '', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('year')).toBeTruthy();
    });

    it('should re-render with error on future date', async () => {
      req.body = {year: '2400', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('date')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
    });

    it('should re-render with error on 2 digit year', async () => {
      req.body = {year: '22', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should accept a valid input', async () => {
      req.body = {year: '2000', month: '1', day: '1', reason: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_END_DATE_URL);
    });

    it('should redirect to interest end date page', async () => {
      req.body = {year: '2021', month: '1', day: '1', reason: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_END_DATE_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {year: '1981', month: '1', day: '1', reason: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
