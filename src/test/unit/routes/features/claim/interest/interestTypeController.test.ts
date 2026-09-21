import {Response} from 'express';
import interestTypeController from '../../../../../../main/routes/features/claim/interest/interestTypeController';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_TOTAL_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Interest} from 'form/models/interest/interest';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/interest/interestService', () => ({
  getInterest: jest.fn(),
  saveInterest: jest.fn(),
}));

describe('Interest type controller', () => {
  const getHandler = getRouteHandler(interestTypeController, 'get');
  const postHandler = getRouteHandler(interestTypeController, 'post');
  const viewPath = 'features/claim/interest/interest-type';
  const pageTitle = 'PAGES.INTEREST_CLAIM_OPTIONS.PAGE_TITLE';
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
    it('should render interest type page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error is thrown', async () => {
      const error = new Error('error');
      mockGetInterest.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render interest type page if there is no selection', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the interest total if same rate for the whole period is selected', async () => {
      req.body = {interestType: InterestClaimOptionsType.SAME_RATE_INTEREST};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveInterest).toHaveBeenCalledWith('user-id', InterestClaimOptionsType.SAME_RATE_INTEREST, 'interestClaimOptions');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_RATE_URL);
    });

    it('should redirect to the break down interest if break down interest for different periods or items is selected', async () => {
      req.body = {interestType: InterestClaimOptionsType.BREAK_DOWN_INTEREST};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_TOTAL_URL);
    });

    it('should re-render if non-existent party type is provided', async () => {
      req.body = {foo: 'blah'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect((res.render as jest.Mock).mock.calls[0][1].form.errorFor('interestType')).toBe('ERRORS.VALID_INTEREST_TYPE_OPTION');
    });

    it('should call next if save fails', async () => {
      const error = new Error('error');
      mockSaveInterest.mockRejectedValue(error);
      req.body = {interestType: InterestClaimOptionsType.SAME_RATE_INTEREST};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
