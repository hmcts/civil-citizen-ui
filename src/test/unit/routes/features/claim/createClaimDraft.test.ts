import {Response} from 'express';
import createDraftClaimController from '../../../../../main/routes/features/claim/createDraftClaim';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, CLAIM_CHECK_ANSWERS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {saveDraftClaimToCache, cloneDefaultDraftClaimCaseData} from 'modules/draft-store/draftClaimCache';
import {createOrLoadDraft, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {isCarmEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/draftClaimCache', () => ({
  saveDraftClaimToCache: jest.fn(),
  cloneDefaultDraftClaimCaseData: jest.fn(() => ({
    resolvingDispute: true,
    completingClaimConfirmed: true,
    claimInterest: 'no',
  })),
}));
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('createDraftClaim Router', () => {
  const getHandler = getRouteHandler(createDraftClaimController, 'get');
  const postHandler = getRouteHandler(createDraftClaimController, 'post');
  const viewPath = 'features/claim/create-draft';
  const responseTestClaimId = '1111222233334444';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
  const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;
  const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
  const mockSaveDraftClaimToCache = saveDraftClaimToCache as jest.Mock;
  const mockCloneDefaultDraft = cloneDefaultDraftClaimCaseData as jest.Mock;
  const mockIsCarmEnabledForCase = isCarmEnabledForCase as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockCreateOrLoadDraft.mockResolvedValue({
      claimResponse: {case_data: {}},
      createdAt: '2026-08-14T10:00:00.000Z',
      rawResponse: {draftId: 'draft-123'},
      isNew: true,
    });
    mockUpdateDraftClaim.mockResolvedValue(undefined);
    mockSaveDraftClaimToCache.mockResolvedValue(undefined);
    mockCloneDefaultDraft.mockReturnValue({
      resolvingDispute: true,
      completingClaimConfirmed: true,
      claimInterest: 'no',
    });
    mockIsCarmEnabledForCase.mockResolvedValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(undefined as never);
  });

  describe('on GET', () => {
    it('should render the create draft view', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, res);
    });
  });

  describe('on POST', () => {
    it('creates a deterministic defendant response draft', async () => {
      req.body = {draftType: 'response'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalledWith(
        `${responseTestClaimId}user-id`,
        expect.objectContaining({legacyCaseReference: '1111-2222-3333-4444', totalClaimAmount: 1000}),
        true,
        'user-id',
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(responseTestClaimId, BILINGUAL_LANGUAGE_PREFERENCE_URL),
      );
    });

    it('should persist the fixture and redirect to check answers', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockCreateOrLoadDraft).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          resolvingDispute: true,
          completingClaimConfirmed: true,
        }),
      );
      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          resolvingDispute: true,
          completingClaimConfirmed: true,
        }),
        'draft-123',
      );
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_CHECK_ANSWERS_URL);
    });

    it('should call next when creating the draft fails', async () => {
      const error = new Error('error');
      mockCreateOrLoadDraft.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
