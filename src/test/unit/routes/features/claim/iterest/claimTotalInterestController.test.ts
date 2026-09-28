import {Response} from 'express';
import claimTotalInterestController from '../../../../../../main/routes/features/claim/interest/claimTotalInterestController';
import {CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {TotalInterest} from 'form/models/interest/totalInterest';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Claim Total Interest Controller', () => {
  const getHandler = getRouteHandler(claimTotalInterestController, 'get');
  const postHandler = getRouteHandler(claimTotalInterestController, 'post');
  const viewPath = 'features/claim/interest/total-claim-interest';
  const pageTitle = 'PAGES.TOTAL_INTEREST.PAGE_TITLE';
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
    it('should render total claim interest page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render total claim interest page with set data', async () => {
      const interest = new Interest();
      interest.totalInterest = new TotalInterest('8', '99 reasons');
      mockGetInterest.mockResolvedValue(interest);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.amount).toBe(8);
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.reason).toBe('99 reasons');
    });

    it('should call next when error occurs', async () => {
      const error = new Error('error');
      mockGetInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

    it('should re-render page with errors', async () => {
      req.body = {amount: '', reason: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('amount')).toBe('ERRORS.TOTAL_INTEREST_AMOUNT_REQUIRED');
      expect(renderedForm().errorFor('reason')).toBe('ERRORS.HOW_YOU_CALCULATED_AMOUNT');
    });

    it('should re-render page with error when negative interest amount is provided', async () => {
      req.body = {amount: '-5', reason: '99 reasons'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('amount')).toBe('ERRORS.VALID_INTEREST_AMOUNT');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the continue claiming interest page', async () => {
      req.body = {amount: '8', reason: '99 reasons'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {amount: '321', reason: 'my reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
