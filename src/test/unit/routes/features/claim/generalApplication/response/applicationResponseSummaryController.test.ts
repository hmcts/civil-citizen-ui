import {Response} from 'express';
import applicationSummaryController from '../../../../../../../main/routes/features/generalApplication/response/applicationResponseSummaryController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {ApplicationResponse, JudicialDecisionOptions} from 'models/generalApplication/applicationResponse';
import {GaServiceClient} from 'client/gaServiceClient';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - Application response summary', () => {
  const getHandler = getRouteHandler(applicationSummaryController, 'get');
  const viewPath = 'features/generalApplication/applications-summary';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const applicationMock = {
    id: '1234567890',
    case_data: {
      applicationTypes: 'Adjourn a hearing',
      judicialDecision: {decision: JudicialDecisionOptions.MAKE_AN_ORDER},
    },
    state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
    last_modified: '2024-05-29T14:39:28.483971',
    created_date: '2024-05-29T14:39:28.483971',
  } as ApplicationResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
  });

  describe('on GET', () => {
    it('should render the summary with the respondent application', async () => {
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [
        {
          id: 'test',
          value: {
            caseLink: {CaseReference: '1234567890'},
            generalAppSubmittedDateGAspec: new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId').mockResolvedValue([applicationMock]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.SUMMARY.MY_APPLICATIONS',
        applicationsRows: [expect.objectContaining({id: applicationMock.id})],
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
