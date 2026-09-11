import {Response} from 'express';
import claimantInterestFromController from '../../../../../../main/routes/features/claim/interest/claimantInterestFromController';
import {CLAIM_INTEREST_START_DATE_URL, CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Claimant Interest From Controller', () => {
  const getHandler = getRouteHandler(claimantInterestFromController, 'get');
  const postHandler = getRouteHandler(claimantInterestFromController, 'post');
  const viewPath = 'features/claim/interest/claimant-interest-from';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE';
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
    it('should render claimant interest from page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render claimant interest from page with values', async () => {
      const interest = new Interest();
      interest.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
      mockGetInterest.mockResolvedValue(interest);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
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
    it('should re-render claimant interest from page if there are form errors', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the help with fees page', async () => {
      req.body = {option: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalledWith('user-id', InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE, 'interestClaimFrom');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should redirect to the interest enter date from page', async () => {
      req.body = {option: InterestClaimFromType.FROM_A_SPECIFIC_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_START_DATE_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {option: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
