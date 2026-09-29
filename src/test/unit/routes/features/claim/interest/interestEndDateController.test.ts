import {Response} from 'express';
import interestEndDateController from '../../../../../../main/routes/features/claim/interest/interestEndDateController';
import {CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {InterestEndDateType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Claimant Interest From Controller', () => {
  const getHandler = getRouteHandler(interestEndDateController, 'get');
  const postHandler = getRouteHandler(interestEndDateController, 'post');
  const viewPath = 'features/claim/interest/interest-end-date';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE';
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
    it('should render interest end page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render interest end page with values', async () => {
      const interest = new Interest();
      interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
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
    it('should re-render interest end page if there are form errors', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the help with fees page with until claim submitted option selected', async () => {
      req.body = {option: InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalledWith('user-id', InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE, 'interestEndDate');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should redirect to the help with fees page with until settled option selected', async () => {
      req.body = {option: InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_HELP_WITH_FEES_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {option: InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
