import {Response} from 'express';
import bilingualLangPreferenceController from '../../../../../main/routes/features/response/bilingualLangPreferenceController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
} from 'services/features/response/bilingualLangPreferenceService';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/bilingualLangPreferenceService', () => ({
  getBilingualLangPreference: jest.fn(),
  saveBilingualLangPreference: jest.fn(),
  getCookieLanguage: jest.fn((welshEnabled: boolean, option: string) => option),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe('Bilingual language preference', () => {
  const getHandler = getRouteHandler(bilingualLangPreferenceController, 'get');
  const postHandler = getRouteHandler(bilingualLangPreferenceController, 'post');
  const viewPath = 'features/response/bilingual-language-preference';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    (getBilingualLangPreference as jest.Mock).mockResolvedValue({option: undefined});
    (saveBilingualLangPreference as jest.Mock).mockResolvedValue(undefined);
    (launchDarklyClient.isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
  });

  describe('on GET', () => {
    it('should render bilingual language preference', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);
      await flush();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        welshEnabled: false,
      }));
    });

    it('should call next when loading the preference fails', async () => {
      const error = new Error('error');
      (getBilingualLangPreference as jest.Mock).mockRejectedValue(error);

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

      expect(saveBilingualLangPreference).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to task list when WELSH_AND_ENGLISH is selected', async () => {
      req.body = {option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when save fails with ENGLISH selected', async () => {
      const error = new Error('error');
      (saveBilingualLangPreference as jest.Mock).mockRejectedValue(error);
      req.body = {option: ClaimBilingualLanguagePreference.ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next when save fails with WELSH_AND_ENGLISH selected', async () => {
      const error = new Error('error');
      (saveBilingualLangPreference as jest.Mock).mockRejectedValue(error);
      req.body = {option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
