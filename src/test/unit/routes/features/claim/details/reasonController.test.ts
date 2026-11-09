import {Response} from 'express';
import reasonController from '../../../../../../main/routes/features/claim/details/reasonController';
import {CLAIM_TIMELINE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/details/claimDetailsService', () => ({
  getClaimDetails: jest.fn(),
  saveClaimDetails: jest.fn(),
}));

describe('Claim Details - Reason', () => {
  const getHandler = getRouteHandler(reasonController, 'get');
  const postHandler = getRouteHandler(reasonController, 'post');
  const viewPath = 'features/claim/details/reason';
  const pageTitle = 'PAGES.REASON.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimDetails = getClaimDetails as jest.Mock;
  const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
    mockSaveClaimDetails.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render reason page when there is no information in redis', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading claim details fails', async () => {
      const error = new Error('error');
      mockGetClaimDetails.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      req.body = {text: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimDetails).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_TIMELINE_URL);
    });

    it('should re-render on no input', async () => {
      req.body = {text: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should accept a valid input', async () => {
      req.body = {text: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_TIMELINE_URL);
    });

    it('should redirect to timeline page', async () => {
      req.body = {text: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_TIMELINE_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimDetails.mockRejectedValue(error);
      req.body = {text: 'reason'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
