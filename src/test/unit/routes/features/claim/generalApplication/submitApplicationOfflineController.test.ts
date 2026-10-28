import path from 'path';
import {Response} from 'express';
import submitApplicationOfflineController from '../../../../../../main/routes/features/generalApplication/submitApplicationOfflineController';
import {BACK_URL, DASHBOARD_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {isQueryManagementEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
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
jest.mock('app/auth/launchdarkly/launchDarklyClient');

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

describe('General Application - submit application offline', () => {
  const getHandler = getRouteHandler(submitApplicationOfflineController, 'get');
  const viewPath = 'features/generalApplication/submit-application-offline';
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
  const isQueryManagementEnabledMock = isQueryManagementEnabled as jest.Mock;

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
    isQueryManagementEnabledMock.mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the offline page with the dashboard back link when query management is off', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: DASHBOARD_URL,
        pageContent: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the offline page with the back link when query management is on', async () => {
      isQueryManagementEnabledMock.mockResolvedValue(true);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: BACK_URL,
        pageContent: expect.any(Array),
      }));
    });
  });
});
