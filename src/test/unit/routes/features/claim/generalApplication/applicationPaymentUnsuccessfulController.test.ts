import {Response} from 'express';
import applicationPaymentUnsuccessfulController from '../../../../../../main/routes/features/generalApplication/applicationPaymentUnsuccessfulController';
import {GA_APPLY_HELP_WITH_FEE_SELECTION} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

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
  };
});

describe('Claim fee unsuccessful payment confirmation', () => {
  const getHandler = getRouteHandler(applicationPaymentUnsuccessfulController, 'get');
  const viewPath = 'features/generalApplication/application-payment-unsuccessful';
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
    built.generalApplication = new GeneralApplication();
    built.generalApplication.applicationTypes.push(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
    return built;
  };

  const settleHandler = async (): Promise<void> => {
    getHandler(req as never, res as unknown as Response, next);
    await new Promise((resolve) => setImmediate(resolve));
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
    (getApplicationFromGAService as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the unsuccessful payment page', async () => {
      await settleHandler();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.PAYMENT_UNSUCCESSFUL.TITLE',
        noCrumbs: true,
        makePaymentAgainUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEE_SELECTION),
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
