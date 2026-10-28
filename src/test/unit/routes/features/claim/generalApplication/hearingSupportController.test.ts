import {Response} from 'express';
import hearingSupportController from '../../../../../../main/routes/features/generalApplication/hearingSupportController';
import {PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {SupportType} from 'models/generalApplication/hearingSupport';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

describe('General Application - Hearing support', () => {
  const getHandler = getRouteHandler(hearingSupportController, 'get');
  const postHandler = getRouteHandler(hearingSupportController, 'post');
  const viewPath = 'features/generalApplication/hearing-support';
  const claimId = '12345';
  let claim: Claim;
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    builtClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the hearing support page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING',
        pageContent: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to paying for the application', async () => {
      req.body = {
        requiredSupport: [SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
        signLanguageContent: 'test1',
        languageContent: 'test2',
        otherContent: 'test3',
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, PAYING_FOR_APPLICATION_URL), 0),
      );
    });

    it('should re-render when other support is selected without details', async () => {
      req.body = {
        requiredSupport: SupportType.OTHER_SUPPORT,
        signLanguageContent: '',
        languageContent: '',
        otherContent: '',
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {requiredSupport: [SupportType.STEP_FREE_ACCESS, SupportType.HEARING_LOOP]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
