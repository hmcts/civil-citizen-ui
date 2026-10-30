import {Request, Response} from 'express';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseState} from 'form/models/claimDetails';
import {getClaimById} from 'modules/utilityService';
import {cancelUnissuedClaimGuard} from 'routes/guards/cancelUnissuedClaimGuard';
import {unissuedClaimCancelledGuard} from 'routes/guards/unissuedClaimCancelledGuard';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const claimId = '1234567890123456';
const dashboardUrl = `/dashboard/${claimId}/claimantNewDesign`;
const mockGetClaimById = getClaimById as jest.Mock;

const buildClaim = (ccdState: CaseState, caseRole = CaseRole.CLAIMANT): Claim => {
  const claim = new Claim();
  claim.ccdState = ccdState;
  claim.caseRole = caseRole;
  return claim;
};

const runGuard = async (guard: typeof cancelUnissuedClaimGuard) => {
  const req = {params: {id: claimId}} as unknown as Request;
  const res = {redirect: jest.fn()} as unknown as Response;
  const next = jest.fn();
  await guard(req, res, next);
  return {res, next};
};

describe('cancelUnissuedClaimGuard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should allow claimant on pending case issued claim', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED));

    const {res, next} = await runGuard(cancelUnissuedClaimGuard);

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when claim already issued', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT));

    const {res} = await runGuard(cancelUnissuedClaimGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
  });

  it('should redirect to dashboard when user is the defendant', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED, CaseRole.DEFENDANT));

    const {res} = await runGuard(cancelUnissuedClaimGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
  });

  it('should pass errors to next', async () => {
    const error = new Error('boom');
    mockGetClaimById.mockRejectedValueOnce(error);

    const {next} = await runGuard(cancelUnissuedClaimGuard);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('unissuedClaimCancelledGuard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should redirect to dashboard when unissued claim is cancelled', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.UNISSUED_CLAIM_CANCELLED));

    const {res, next} = await runGuard(unissuedClaimCancelledGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(next).not.toHaveBeenCalled();
  });

  it('should continue for any other state', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED));

    const {res, next} = await runGuard(unissuedClaimCancelledGuard);

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should pass errors to next', async () => {
    const error = new Error('boom');
    mockGetClaimById.mockRejectedValueOnce(error);

    const {next} = await runGuard(unissuedClaimCancelledGuard);

    expect(next).toHaveBeenCalledWith(error);
  });
});
