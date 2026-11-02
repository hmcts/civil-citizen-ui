import {Response} from 'express';
import helpWithFeesContentController from '../../../../../../../main/routes/features/generalApplication/applicationFee/helpWithFeesContentController';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
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

describe('General Application - Apply for help with fees', () => {
  const getHandler = getRouteHandler(helpWithFeesContentController, 'get');
  const viewPath = 'features/generalApplication/applicationFee/help-with-application-fee-content';
  const claimId = '12345';
  const appId = '67890';
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
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
  });

  describe('on GET', () => {
    it('should render the application fee help content', async () => {
      req.query = {additionalFeeTypeFlag: 'false'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=false'),
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].applyHelpWithFeeContents))
        .toContain('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
    });

    it('should render the additional application fee help content', async () => {
      req.query = {additionalFeeTypeFlag: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=true'),
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].applyHelpWithFeeContents))
        .toContain('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING');
    });
  });
});
