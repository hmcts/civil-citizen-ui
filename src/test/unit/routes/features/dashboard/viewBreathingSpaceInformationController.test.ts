import {Response} from 'express';
import viewBreathingSpaceInformationController from 'routes/features/dashboard/viewBreathingSpaceInformationController';
import {BREATHING_SPACE_INFO_URL, DASHBOARD_CLAIMANT_URL, QM_START_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {isQueryManagementEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {getBSGuidanceContent, getSupportLinks} from 'services/dashboard/breathingSpaceGuidanceContentBuilder';
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
jest.mock('services/dashboard/breathingSpaceGuidanceContentBuilder', () => ({
  getBSGuidanceContent: jest.fn(),
  getSupportLinks: jest.fn(),
}));

const viewPath = 'features/dashboard/breathing-space-info';
const claimId = '123';
const queryManagementLink = `${constructResponseUrlWithIdParams(claimId, QM_START_URL)}?linkFrom=start`;
const contentList = [{type: 'title', data: {text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.PAGE_TITLE'}}];
const supportLinks = [{text: 'support', url: '/support'}];

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
  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
    (getBSGuidanceContent as jest.Mock).mockReturnValue(contentList);
    (getSupportLinks as jest.Mock).mockReturnValue(['support-title', supportLinks]);
  });

  it('should render breathing space guidance with the email contact when query management is off', async () => {
    const {res} = await invoke();

    expect(getBSGuidanceContent).toHaveBeenCalledWith('en', queryManagementLink, false);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      contentList,
      iWantToTitle: 'support-title',
      iWantToLinks: supportLinks,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    });
  });

  it('should include the query management link when the flag is on', async () => {
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke();

    expect(getBSGuidanceContent).toHaveBeenCalledWith('en', queryManagementLink, true);
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      contentList,
    }));
  });

  it('should call next when the claim cannot be loaded', async () => {
    const error = new Error('claim retrieval failed');
    (getClaimById as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
