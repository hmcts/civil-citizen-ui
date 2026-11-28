import {AppRequest} from 'models/AppRequest';
import cancelUnissuedClaimController from '../../../../../main/routes/features/cancelUnissuedClaim/cancelUnissuedClaimController';
import {
  CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_URL,
} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient');
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn(() => 'redis-key'),
}));
jest.mock('routes/guards/cancelUnissuedClaimGuard', () => ({
  cancelUnissuedClaimGuard: jest.fn((req, res, next) => next()),
}));

describe('Cancel unissued claim controller', () => {
  const claimId = '1234567890123456';
  const getHandler = getRouteHandler(cancelUnissuedClaimController, 'get', CANCEL_UNISSUED_CLAIM_URL);
  const postHandler = getRouteHandler(cancelUnissuedClaimController, 'post', CANCEL_UNISSUED_CLAIM_URL);
  const confirmationHandler = getRouteHandler(cancelUnissuedClaimController, 'get', CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL);
  const mockSubmit = CivilServiceClient.prototype.submitCancelUnissuedClaim as jest.Mock;
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

      expect(res.render).toHaveBeenCalledWith('features/cancelUnissuedClaim/cancel-unissued-claim', expect.objectContaining({
        maxLength: 200,
        dashboardUrl: `/dashboard/${claimId}/claimantNewDesign`,
        pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM.PAGE_TITLE',
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.cancelReason).toBeUndefined();
      expect(form.hasErrors()).toBe(false);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('on GET after switching language', () => {
    it('should restore the reason that failed validation and show its error again', async () => {
      req.query = {lang: 'cy'};
      req.session.cancelUnissuedClaimReason = {claimId, reason: 'a'.repeat(201)};

      await getHandler(req as AppRequest, res as never, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.cancelReason).toBe('a'.repeat(201));
      expect(form.errorFor('cancelReason')).toBe('ERRORS.CANCEL_UNISSUED_CLAIM_REASON_TOO_LONG');
    });

    it('should not restore a reason saved for a different claim', async () => {
      req.query = {lang: 'cy'};
      req.session.cancelUnissuedClaimReason = {claimId: 'other-claim', reason: '$$$'};

      await getHandler(req as AppRequest, res as never, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.cancelReason).toBeUndefined();
      expect(form.hasErrors()).toBe(false);
      expect(req.session.cancelUnissuedClaimReason).toBeUndefined();
    });

    it('should start empty and clear the saved reason when the page is revisited without a language switch', async () => {
      req.session.cancelUnissuedClaimReason = {claimId, reason: '$$$'};

      await getHandler(req as AppRequest, res as never, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.cancelReason).toBeUndefined();
      expect(req.session.cancelUnissuedClaimReason).toBeUndefined();
    });
  });

  describe('on POST', () => {
    it('should submit the event with the reason and redirect to confirmation', async () => {
      req.body = {cancelReason: '  Settled outside the portal  '};

      await postHandler(req as AppRequest, res as never, next);

      expect(mockSubmit).toHaveBeenCalledWith(claimId, {cancelUnissuedClaimReason: 'Settled outside the portal'}, req);
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

    it('should count a submitted new line as one character', async () => {
      req.body = {cancelReason: 'a'.repeat(99) + '\r\n' + 'b'.repeat(100)};

      await postHandler(req as AppRequest, res as never, next);

      expect(mockSubmit).toHaveBeenCalledWith(claimId, {cancelUnissuedClaimReason: 'a'.repeat(99) + '\n' + 'b'.repeat(100)}, req);
    });

    it.each([
      ['more than 200 characters', 'a'.repeat(201), 'ERRORS.CANCEL_UNISSUED_CLAIM_REASON_TOO_LONG'],
      ['non-standard characters', 'Placeholder input text***', 'ERRORS.CANCEL_UNISSUED_CLAIM_REASON_INVALID_CHARACTERS'],
    ])('should re-render with an error and not submit when the reason has %s', async (_case, reason, error) => {
      req.body = {cancelReason: reason};

      await postHandler(req as AppRequest, res as never, next);

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.errorFor('cancelReason')).toBe(error);
      expect(form.model.cancelReason).toBe(reason);
      expect(req.session.cancelUnissuedClaimReason).toEqual({claimId, reason});
    });

    it('should clear any saved reason once the claim is cancelled', async () => {
      req.session.cancelUnissuedClaimReason = {claimId, reason: '$$$'};
      req.body = {cancelReason: 'Settled'};

      await postHandler(req as AppRequest, res as never, next);

      expect(req.session.cancelUnissuedClaimReason).toBeUndefined();
      expect(mockSubmit).toHaveBeenCalled();
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

      expect(res.render).toHaveBeenCalledWith('features/cancelUnissuedClaim/cancel-unissued-claim-confirmation', {
        pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM.CONFIRMATION_PAGE_TITLE',
      });
    });
  });
});
