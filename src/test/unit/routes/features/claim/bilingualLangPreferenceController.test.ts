import {Response} from 'express';
import claimBilingualLangPreferenceController from '../../../../../main/routes/features/claim/bilingualLangPreferenceController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveClaimantBilingualLangPreference} from 'services/features/response/bilingualLangPreferenceService';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/bilingualLangPreferenceService', () => ({
  saveClaimantBilingualLangPreference: jest.fn(),
  getCookieLanguage: jest.fn((welshEnabled: boolean, option: string) => option),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe('Bilingual language preference', () => {
  const getHandler = getRouteHandler(claimBilingualLangPreferenceController, 'get');
  const postHandler = getRouteHandler(claimBilingualLangPreferenceController, 'post');
  const viewPath = 'features/claim/claim-bilingual-language-preference';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: 'claim-id'},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    const draftClaim = new Claim();
    draftClaim.draftClaimCreatedAt = new Date();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(draftClaim);
    (saveClaimantBilingualLangPreference as jest.Mock).mockResolvedValue(undefined);
    (launchDarklyClient.isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime').mockResolvedValue(undefined);
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(undefined as never);
  });

  describe('on GET', () => {
    it('should render bilingual language preference', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);
      await flush();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIM_BILINGUAL_LANGUAGE_PREFERENCE.PAGE_TITLE',
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);
      await flush();

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to task list when ENGLISH is selected', async () => {
      req.body = {option: ClaimBilingualLanguagePreference.ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(saveClaimantBilingualLangPreference).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should redirect to task list when WELSH_AND_ENGLISH is selected', async () => {
      req.body = {option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      (saveClaimantBilingualLangPreference as jest.Mock).mockRejectedValue(error);
      req.body = {option: ClaimBilingualLanguagePreference.ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
