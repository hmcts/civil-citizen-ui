import {Response} from 'express';
import claimInterestController from '../../../../../../main/routes/features/claim/interest/claimInterestController';
import {
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_HELP_WITH_FEES_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {
  getClaimInterest,
  saveClaimInterest,
} from 'services/features/claim/interest/claimInterestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/claimInterestService', () => {
  const actual = jest.requireActual('services/features/claim/interest/claimInterestService');
  return {
    ...actual,
    getClaimInterest: jest.fn(),
    saveClaimInterest: jest.fn(),
  };
});

describe('Claim Interest page', () => {
  const getHandler = getRouteHandler(claimInterestController, 'get');
  const postHandler = getRouteHandler(claimInterestController, 'post');
  const viewPath = 'features/claim/interest/claim-interest';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimInterest = getClaimInterest as jest.Mock;
  const mockSaveClaimInterest = saveClaimInterest as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimInterest.mockResolvedValue(new GenericYesNo());
    mockSaveClaimInterest.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render claim interest page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetClaimInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the How do you want to claim interest screen when option is Yes', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimInterest).toHaveBeenCalledWith('user-id', YesNo.YES);
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_TYPE_URL);
    });

    it('should redirect to the Help with fees screen when option is No', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimInterest).toHaveBeenCalledWith('user-id', YesNo.NO);
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimInterest.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
