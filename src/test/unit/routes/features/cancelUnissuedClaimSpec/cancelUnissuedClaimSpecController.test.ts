import {AppRequest} from 'models/AppRequest';
import cancelUnissuedClaimSpecController from '../../../../../main/routes/features/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecController';
import {
  CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_SPEC_URL,
} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient');
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn(() => 'redis-key'),
}));
jest.mock('routes/guards/cancelUnissuedClaimSpecGuard', () => ({
  cancelUnissuedClaimSpecGuard: jest.fn((req, res, next) => next()),
}));

describe('Cancel unissued claim spec controller', () => {
  const claimId = '1234567890123456';
  const getHandler = getRouteHandler(cancelUnissuedClaimSpecController, 'get', CANCEL_UNISSUED_CLAIM_SPEC_URL);
  const postHandler = getRouteHandler(cancelUnissuedClaimSpecController, 'post', CANCEL_UNISSUED_CLAIM_SPEC_URL);
  const confirmationHandler = getRouteHandler(cancelUnissuedClaimSpecController, 'get', CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL);
  const mockSubmit = CivilServiceClient.prototype.submitCancelUnissuedClaimSpec as jest.Mock;
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
  });

  describe('on GET', () => {
    it('should render the cancel unissued claim page with a link back to the dashboard', async () => {
      await getHandler(req as AppRequest, res as never, next);

      expect(res.render).toHaveBeenCalledWith('features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec', {
        dashboardUrl: `/dashboard/${claimId}/claimantNewDesign`,
        pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM_SPEC.PAGE_TITLE',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should submit the event with the reason and redirect to confirmation', async () => {
      req.body = {cancelReason: '  Settled outside the portal  '};

      await postHandler(req as AppRequest, res as never, next);

      expect(mockSubmit).toHaveBeenCalledWith(claimId, {cancelUnissuedClaimSpecReason: 'Settled outside the portal'}, req);
      expect(generateRedisKey).toHaveBeenCalledWith(req);
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith('redis-key');
      expect(res.redirect).toHaveBeenCalledWith(`/case/${claimId}/cancel-unissued-claim/confirmation`);
    });

    it('should submit the event without a reason when none is provided', async () => {
      req.body = {cancelReason: '   '};

      await postHandler(req as AppRequest, res as never, next);

      expect(mockSubmit).toHaveBeenCalledWith(claimId, {}, req);
      expect(res.redirect).toHaveBeenCalledWith(`/case/${claimId}/cancel-unissued-claim/confirmation`);
    });

    it('should pass errors to next when submission fails', async () => {
      const error = new Error('submit failed');
      mockSubmit.mockRejectedValueOnce(error);

      await postHandler(req as AppRequest, res as never, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('on GET confirmation', () => {
    it('should render the confirmation page', async () => {
      await confirmationHandler(req as AppRequest, res as never, next);

      expect(res.render).toHaveBeenCalledWith('features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec-confirmation', {
        pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM_SPEC.CONFIRMATION_PAGE_TITLE',
      });
    });
  });
});
