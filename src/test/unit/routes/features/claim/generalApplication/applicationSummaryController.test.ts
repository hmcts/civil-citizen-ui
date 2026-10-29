import path from 'path';
import {Response} from 'express';
import applicationSummaryController from '../../../../../../main/routes/features/generalApplication/applicationSummaryController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {ApplicationResponse, JudicialDecisionOptions} from 'models/generalApplication/applicationResponse';
import * as civilServiceClient from 'client/civilServiceClient';
import * as gaServiceClient from 'client/gaServiceClient';
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
jest.mock('client/civilServiceClient', () => {
  const retrieveClaimDetails = jest.fn();
  const getGeneralApplicationFee = jest.fn().mockResolvedValue({
    calculatedAmountInPence: 11900,
    code: 'FEE',
    version: '1',
  });
  const CivilServiceClient = jest.fn().mockImplementation(() => ({
    retrieveClaimDetails,
    getGeneralApplicationFee,
  }));
  return {CivilServiceClient, retrieveClaimDetails};
});
jest.mock('client/gaServiceClient', () => {
  const getApplicationsByCaseId = jest.fn();
  const GaServiceClient = jest.fn().mockImplementation(() => ({
    getApplicationsByCaseId,
  }));
  return {GaServiceClient, getApplicationsByCaseId};
});

const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

beforeAll(async () => {
  if (i18next.isInitialized) {
    return;
  }
  await i18next.use(Backend).init({
    backend: {
      loadPath: path.join(__dirname, '../../../../../../main/modules/i18n/locales/{{lng}}.json'),
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'cy'],
    load: 'languageOnly',
    initImmediate: false,
  });
});

describe('General Application - application summary', () => {
  const getHandler = getRouteHandler(applicationSummaryController, 'get');
  const viewPath = 'features/generalApplication/applications-summary';
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
  const mockRetrieveClaimDetails = (civilServiceClient as unknown as {retrieveClaimDetails: jest.Mock}).retrieveClaimDetails;
  const mockGetApplicationsByCaseId = (gaServiceClient as unknown as {getApplicationsByCaseId: jest.Mock}).getApplicationsByCaseId;

  const applicationMock: ApplicationResponse = {
    id: '1234567890',
    case_data: {
      applicationTypes: 'Adjourn a hearing',
      parentClaimantIsApplicant: null,
      judicialDecision: {
        decision: JudicialDecisionOptions.MAKE_AN_ORDER,
      },
    },
    state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
    last_modified: '2024-05-29T14:39:28.483971',
    created_date: '2024-05-29T14:39:28.483971',
  } as ApplicationResponse;

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {lang: 'en'},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);

    const ccdClaim = new Claim();
    ccdClaim.generalApplications = [
      {
        id: 'test',
        value: {
          caseLink: {
            CaseReference: '1234567890',
          },
          generalAppSubmittedDateGAspec: new Date('2024-05-29T14:39:28.483971'),
        },
      },
    ] as Claim['generalApplications'];
    mockRetrieveClaimDetails.mockResolvedValue(ccdClaim);
    mockGetApplicationsByCaseId.mockResolvedValue([applicationMock]);
  });

  describe('on GET', () => {
    it('should render the applications summary with the application row', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.SUMMARY.MY_APPLICATIONS',
        applicationsRows: [
          expect.objectContaining({
            id: applicationMock.id,
            types: expect.any(String),
            createdDate: expect.stringContaining('29 May 2024'),
          }),
        ],
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
