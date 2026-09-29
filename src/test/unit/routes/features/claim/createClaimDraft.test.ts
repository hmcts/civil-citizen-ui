import {Response} from 'express';
import createDraftClaimController from '../../../../../main/routes/features/claim/createDraftClaim';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, CLAIM_CHECK_ANSWERS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createDraftClaimInStoreWithExpiryTime, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {saveDraftClaimToCache} from 'modules/draft-store/draftClaimCache';
import {isCarmEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/draftClaimCache');
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
  const mockCreateDraftClaim = createDraftClaimInStoreWithExpiryTime as jest.Mock;
  const mockSaveDraftClaimToCache = saveDraftClaimToCache as jest.Mock;
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
    mockCreateDraftClaim.mockResolvedValue(undefined);
    mockSaveDraftClaimToCache.mockResolvedValue(undefined);
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

    it('should redirect to check answers page', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockCreateDraftClaim).toHaveBeenCalledWith('user-id');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_CHECK_ANSWERS_URL);
    });

    it('should call next when creating the draft fails', async () => {
      const error = new Error('error');
      mockCreateDraftClaim.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
