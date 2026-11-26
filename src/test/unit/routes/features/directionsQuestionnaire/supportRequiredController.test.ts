import {Response} from 'express';
import supportRequiredController from '../../../../../main/routes/features/directionsQuestionnaire/supportRequiredController';
import {DQ_COURT_LOCATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import * as launchDarklyClient from 'app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

describe('Support required', () => {
  const getHandler = getRouteHandler(supportRequiredController, 'get');
  const postHandler = getRouteHandler(supportRequiredController, 'post');
  const viewPath = 'features/directionsQuestionnaire/support-required-list';
  const claimId = '12345';
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: ReturnType<typeof createMockSession>;
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;
  const isCarmEnabledForCase = launchDarklyClient.isCarmEnabledForCase as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const flush = async () => {
    for (let i = 0; i < 5; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  };

  const expectFormErrors = async () => {
    await flush();
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    expect(mockSaveDraftClaim).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
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
    isCarmEnabledForCase.mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the support required page', async () => {
      await getHandler(req as never, res as unknown as Response, next);
      await flush();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.SUPPORT_REQUIRED.PAGE_TITLE',
        carmEnabled: false,
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
    it('should re-render when no option is selected', async () => {
      req.body = {model: {items: []}};

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should re-render when yes is selected but no name is provided', async () => {
      req.body = {
        option: YesNo.YES,
        model: {items: [{fullName: ''}]},
      };

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should re-render when yes is selected but no support is selected', async () => {
      req.body = {
        option: YesNo.YES,
        model: {items: [{fullName: 'johndoe'}]},
      };

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should re-render when a sign language interpreter is selected without details', async () => {
      req.body = {
        option: YesNo.YES,
        model: {
          items: [{
            declared: 'signLanguageInterpreter',
            fullName: 'johndoe',
          }],
        },
      };

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should re-render when a language interpreter is selected without details', async () => {
      req.body = {
        option: YesNo.YES,
        model: {
          items: [{
            declared: 'languageInterpreter',
            fullName: 'johndoe',
          }],
        },
      };

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should re-render when other support is selected without details', async () => {
      req.body = {
        option: YesNo.YES,
        model: {
          items: [{
            declared: 'otherSupport',
            fullName: 'johndoe',
          }],
        },
      };

      await postHandler(req as never, res as unknown as Response, next);

      await expectFormErrors();
    });

    it('should save and redirect to court location when yes is selected with support', async () => {
      req.body = {
        option: YesNo.YES,
        model: {
          items: [{
            declared: 'disabledAccess',
            fullName: 'johndoe',
          }],
        },
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL));
    });

    it('should save and redirect to court location when no is selected', async () => {
      req.body = {option: YesNo.NO, model: {}};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = {option: YesNo.NO, model: {}};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
