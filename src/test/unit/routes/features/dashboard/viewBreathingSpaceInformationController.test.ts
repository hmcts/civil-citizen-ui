import {Response} from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import viewBreathingSpaceInformationController from 'routes/features/dashboard/viewBreathingSpaceInformationController';
import {BREATHING_SPACE_ENTER_URL, BREATHING_SPACE_INFO_URL, DASHBOARD_CLAIMANT_URL, QM_START_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {isQueryManagementEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isQueryManagementEnabled: jest.fn(),
}));

const viewPath = 'features/dashboard/breathing-space-info';
const claimId = '123';
const entryUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_ENTER_URL);
const queryManagementLink = `${constructResponseUrlWithIdParams(claimId, QM_START_URL)}?linkFrom=start`;

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.submittedDate = new Date('2024-01-01');
  claim.applicant1 = new Party();
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewBreathingSpaceInformationController, 'get', BREATHING_SPACE_INFO_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {lang: 'en'},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('View breathing space information', () => {
  beforeAll(async () => {
    if (!i18next.isInitialized) {
      await i18next.use(Backend).init({
        backend: {
          loadPath: path.join(__dirname, '../../../../../main/modules/i18n/locales/{{lng}}.json'),
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'cy'],
        load: 'languageOnly',
        initAsync: false,
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
  });

  it('should render breathing space guidance with the enter details link', async () => {
    const {res} = await invoke();
    const content = JSON.stringify((res.render as jest.Mock).mock.calls[0][1].contentList);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      iWantToLinks: expect.any(Array),
    }));
    expect(content).toContain(entryUrl);
    expect(content).toContain('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.ENTER_BREATHING_SPACE_DETAILS');
    expect(content).toContain('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS');
    expect(content).not.toContain(queryManagementLink);
    expect(content).not.toContain('mailto:contactocmc@justice.gov.uk');
  });

  it('should keep the enter details link when query management is on', async () => {
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke();
    const content = JSON.stringify((res.render as jest.Mock).mock.calls[0][1].contentList);

    expect(content).toContain(entryUrl);
    expect(content).not.toContain(queryManagementLink);
    expect(content).not.toContain('You can send messages and documents to the court');
  });

  it('should call next when the claim cannot be loaded', async () => {
    const error = new Error('claim retrieval failed');
    (getClaimById as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
