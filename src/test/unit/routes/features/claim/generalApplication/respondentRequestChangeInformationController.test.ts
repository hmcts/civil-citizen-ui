import {Response} from 'express';
import respondentRequestChangeInformationController from '../../../../../../main/routes/features/generalApplication/respondentRequestChangeInformationController';
import {DASHBOARD_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
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

describe('General Application - respondent request change information', () => {
  const getHandler = getRouteHandler(respondentRequestChangeInformationController, 'get');
  const viewPath = 'features/generalApplication/respondent-request-change-information';
  const claimId = '12345';
  const appId = '345';
  let claim: Claim;
  let req: {
    params: {id: string; appId: string};
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
      params: {id: claimId, appId},
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
    it('should render the respondent information page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: DASHBOARD_URL,
        contentList: expect.any(Array),
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
});
