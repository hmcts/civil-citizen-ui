import {Response} from 'express';
import welshLanguageController from '../../../../../../main/routes/features/directionsQuestionnaire/welshLanguageRequirements/welshLanguageController';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import * as launchDarklyClient from 'app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

describe('Welsh Language Controller', () => {
  const getHandler = getRouteHandler(welshLanguageController, 'get');
  const postHandler = getRouteHandler(welshLanguageController, 'post');
  const viewPath = 'features/directionsQuestionnaire/welshLanguageRequirements/welsh-language';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; session: ReturnType<typeof createMockSession>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

  const buildClaim = (ccdState?: CaseState): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    claim.ccdState = ccdState;
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      session: createMockSession({user: {id: 'user-1'}}),
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(`${claimId}user-1`);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockGetResponseDraft.mockResolvedValue({
      claimResponse: {case_data: buildClaim()},
      rawResponse: {draftId: 'draft-1'},
      createdAt: new Date().toISOString(),
    });
    mockUpdateResponseDraft.mockResolvedValue(undefined);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the welsh language page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        pageTitle: 'PAGES.WELSH_LANGUAGE.PAGE_TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the spoken language is missing', async () => {
      req.body = {documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the documents language is missing', async () => {
      req.body = {speakLanguage: LanguageOptions.ENGLISH};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to the response task list', async () => {
      req.body = {speakLanguage: LanguageOptions.ENGLISH, documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
      );
    });

    it('should redirect to the claimant response task list when claimant intention is pending', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim(CaseState.AWAITING_APPLICANT_INTENTION));
      req.body = {speakLanguage: LanguageOptions.ENGLISH, documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = {speakLanguage: LanguageOptions.ENGLISH, documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
