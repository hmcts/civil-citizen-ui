import {Response} from 'express';
import bilingualLangPreferenceController from 'routes/features/response/bilingualLangPreferenceController';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
} from 'services/features/response/bilingualLangPreferenceService';
import {isWelshEnabledForMainCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/bilingualLangPreferenceService', () => {
  const actual = jest.requireActual('services/features/response/bilingualLangPreferenceService');
  return {
    ...actual,
    getBilingualLangPreference: jest.fn(),
    saveBilingualLangPreference: jest.fn(),
  };
});
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isWelshEnabledForMainCase: jest.fn(),
}));

const viewPath = 'features/response/bilingual-language-preference';
const claimId = '12345';

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(bilingualLangPreferenceController, method, BILINGUAL_LANGUAGE_PREFERENCE_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  await flushAsync();
  return {res, next};
};

describe('Bilingual language preference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    (getBilingualLangPreference as jest.Mock).mockResolvedValue(new GenericYesNo());
    (saveBilingualLangPreference as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the bilingual language preference page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({welshEnabled: false}));
    });

    it('should return the error when the preference cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getBilingualLangPreference as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no language is selected', async () => {
      const {res} = await invoke('post', {body: {}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveBilingualLangPreference).not.toHaveBeenCalled();
    });

    it('should save English, set the language cookie and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {option: ClaimBilingualLanguagePreference.ENGLISH}});

      expect(res.cookie).toHaveBeenCalledWith('lang', 'en', {secure: true});
      expect(saveBilingualLangPreference).toHaveBeenCalledWith(
        claimId,
        expect.objectContaining({option: ClaimBilingualLanguagePreference.ENGLISH}),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save Welsh and English and set the Welsh cookie when Welsh is disabled', async () => {
      const {res} = await invoke('post', {body: {option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH}});

      expect(res.cookie).toHaveBeenCalledWith('lang', 'cy', {secure: true});
      expect(saveBilingualLangPreference).toHaveBeenCalledWith(
        claimId,
        expect.objectContaining({option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH}),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when saving the preference fails', async () => {
      const error = new Error('redis failure');
      (saveBilingualLangPreference as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: ClaimBilingualLanguagePreference.ENGLISH}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
