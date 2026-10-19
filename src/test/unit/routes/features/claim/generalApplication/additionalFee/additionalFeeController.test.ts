import {Response} from 'express';
import additionalFeeController from '../../../../../../../main/routes/features/generalApplication/additionalFee/additionalFeeController';
import {GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL, GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {
  getApplicationFromGAService,
  getApplicationIndex,
} from 'services/features/generalApplication/generalApplicationService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => {
  const actual = jest.requireActual('services/features/generalApplication/generalApplicationService');
  return {
    ...actual,
    getApplicationFromGAService: jest.fn(),
    getApplicationIndex: jest.fn(),
  };
});

describe('General Application - Pay additional fee Page', () => {
  const getHandler = getRouteHandler(additionalFeeController, 'get');
  const viewPath = 'features/generalApplication/additionalFee/additional-fee';
  const claimId = '12345';
  const appId = '67890';
  let claim: Claim;
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => {
    const built = new Claim();
    built.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    built.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    return built;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getApplicationIndex as jest.Mock).mockResolvedValue(0);
    (getApplicationFromGAService as jest.Mock).mockResolvedValue({
      id: '1234567890',
      case_data: {
        applicationFeeAmountInPence: 10000,
        generalAppPBADetails: {fee: {calculatedAmountInPence: 5000}},
      },
    } as ApplicationResponse);
  });

  describe('on GET', () => {
    it('should render the additional fee page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        urlNextView: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL),
        backLinkUrl: `${constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_VIEW_APPLICATION_URL)}?index=1`,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
