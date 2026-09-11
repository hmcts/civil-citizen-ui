import {Response} from 'express';
import claimantInterestRateController from '../../../../../../main/routes/features/claim/interest/claimantInterestRateController';
import {CLAIM_INTEREST_DATE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {SameRateInterestType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Claimant Interest Rate', () => {
  const getHandler = getRouteHandler(claimantInterestRateController, 'get');
  const postHandler = getRouteHandler(claimantInterestRateController, 'post');
  const viewPath = 'features/claim/interest/claimant-interest-rate';
  const pageTitle = 'PAGES.CLAIMANT_INTEREST_RATE.PAGE_TITLE';
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
    it('should render claimant interest rate page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error occurs', async () => {
      const error = new Error('error');
      mockGetInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on Post', () => {
    const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

    it('should redirect when interest is provided with different rate', async () => {
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: 40,
        reason: 'Reasons....',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_DATE_URL);
    });

    it('should redirect when interest is provided with 8% rate', async () => {
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
        differentRate: '',
        reason: '',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_DATE_URL);
    });

    it('should re-render when different interest selected and not provided', async () => {
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: '',
        reason: '',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('differentRate')).toBe('ERRORS.RATE_CORRECT_THE_ONE_ENTERED');
    });

    it('should re-render when different interest selected and reasons not provided', async () => {
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: 40,
        reason: '',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
    });

    it('should re-render when negative interest rate is provided', async () => {
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: -5,
        reason: 'Reasons....',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('differentRate')).toBe('ERRORS.VALID_INTEREST_RATE');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        differentRate: 40,
        reason: 'Reasons....',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
