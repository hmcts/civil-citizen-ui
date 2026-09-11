import {Response} from 'express';
import continueClaimingInterestController from '../../../../../../main/routes/features/claim/interest/continueClaimingInterestController';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {YesNo} from 'form/models/yesNo';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Continue Claiming Interest page', () => {
  const getHandler = getRouteHandler(continueClaimingInterestController, 'get');
  const postHandler = getRouteHandler(continueClaimingInterestController, 'post');
  const viewPath = 'features/claim/interest/continue-claiming-interest';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.CONTINUE_CLAIMING_INTEREST.PAGE_TITLE';
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
    it('should render continue claiming interest page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the How much do you want to continue claiming screen when option is Yes', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalledWith('user-id', YesNo.YES, 'continueClaimingInterest');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_HOW_MUCH_URL);
    });

    it('should redirect to the Help with fees screen when option is No', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
