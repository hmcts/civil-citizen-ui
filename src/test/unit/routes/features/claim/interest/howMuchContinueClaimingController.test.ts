import {Response} from 'express';
import howMuchContinueClaimingController from '../../../../../../main/routes/features/claim/interest/howMuchContinueClaimingController';
import {CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
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

describe('How Much Continue Claiming Page', () => {
  const getHandler = getRouteHandler(howMuchContinueClaimingController, 'get');
  const postHandler = getRouteHandler(howMuchContinueClaimingController, 'post');
  const viewPath = 'features/claim/interest/how-much-continue-claiming';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.HOW_MUCH_CONTINUE.PAGE_TITLE';
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
    it('should render how much continue claiming page', async () => {
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

  describe('on POST', () => {
    const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

    it('should redirect to help with fees page when interest is provided with 8% rate', async () => {
      req.body = {
        option: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
        dailyInterestAmount: null,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should redirect to help with fees page when interest is provided with specific daily rate', async () => {
      req.body = {
        option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        dailyInterestAmount: 100.10,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should re-render when no option selected', async () => {
      req.body = {
        option: undefined,
        dailyInterestAmount: null,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('option')).toBe('ERRORS.CHOOSE_TYPE_OF_INTEREST');
    });

    it('should re-render when specific daily amount selected and not provided', async () => {
      req.body = {
        option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        dailyInterestAmount: null,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('dailyInterestAmount')).toBe('ERRORS.VALID_AMOUNT');
    });

    it('should re-render when specific daily amount selected and more than two decimal places', async () => {
      req.body = {
        option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        dailyInterestAmount: 100.123,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('dailyInterestAmount')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {
        option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
        dailyInterestAmount: 100.10,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
