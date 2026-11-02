import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Party} from 'models/party';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import trialArrangementsConfirmationController from 'routes/features/caseProgression/trialArrangements/trialArrangementsConfirmationController';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, DASHBOARD_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const claimId = '1111';
const viewPath = 'features/caseProgression/trialArrangements/finalise-trial-arrangements-confirmation';

const readyClaim = (isCaseReady: YesNo): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.caseRole = CaseRole.DEFENDANT;
  claim.totalClaimAmount = 15000;
  claim.caseProgression = new CaseProgression();
  claim.caseProgression.defendantTrialArrangements = new TrialArrangements();
  claim.caseProgression.defendantTrialArrangements.isCaseReady = isCaseReady;
  return claim;
};

describe('Confirm trial arrangements', () => {
  const getHandler = getRouteHandler(
    trialArrangementsConfirmationController,
    'get',
    CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the confirmation page when the case is ready', async () => {
    mockGetClaimById.mockResolvedValue(readyClaim(YesNo.YES));
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      readyForTrialOrHearing: true,
      latestUpdateUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_URL),
      noCrumbs: true,
      trialArrangementsConfirmationContent: expect.any(Array),
    }));
  });

  it('renders the confirmation page when the case is not ready', async () => {
    mockGetClaimById.mockResolvedValue(readyClaim(YesNo.NO));
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      readyForTrialOrHearing: false,
    }));
  });

  it('does not render when the claim is empty', async () => {
    mockGetClaimById.mockResolvedValue(new Claim());
    const res = createMockResponse();
    const next = jest.fn();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      next,
    );

    expect(res.render).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);
    const next = jest.fn();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      createMockResponse() as unknown as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
