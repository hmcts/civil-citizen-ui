import {Request, Response} from 'express';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseState} from 'form/models/claimDetails';
import {getClaimById} from 'modules/utilityService';
import {cancelUnissuedClaimSpecGuard} from 'routes/guards/cancelUnissuedClaimSpecGuard';
import {claimUnissuedCancelledGuard} from 'routes/guards/claimUnissuedCancelledGuard';

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

const runGuard = async (guard: typeof cancelUnissuedClaimSpecGuard) => {
  const req = {params: {id: claimId}} as unknown as Request;
  const res = {redirect: jest.fn()} as unknown as Response;
  const next = jest.fn();
  await guard(req, res, next);
  return {res, next};
};

describe('cancelUnissuedClaimSpecGuard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should allow claimant on pending case issued claim', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED));

    const {res, next} = await runGuard(cancelUnissuedClaimSpecGuard);

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when claim already issued', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT));

    const {res} = await runGuard(cancelUnissuedClaimSpecGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
  });

  it('should redirect to dashboard when user is the defendant', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED, CaseRole.DEFENDANT));

    const {res} = await runGuard(cancelUnissuedClaimSpecGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
  });

  it('should pass errors to next', async () => {
    const error = new Error('boom');
    mockGetClaimById.mockRejectedValueOnce(error);

    const {next} = await runGuard(cancelUnissuedClaimSpecGuard);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('claimUnissuedCancelledGuard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should redirect to dashboard when unissued claim is cancelled', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.CLAIM_UNISSUED_CANCELLED));

    const {res, next} = await runGuard(claimUnissuedCancelledGuard);

    expect(res.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(next).not.toHaveBeenCalled();
  });

  it('should continue for any other state', async () => {
    mockGetClaimById.mockResolvedValueOnce(buildClaim(CaseState.PENDING_CASE_ISSUED));

    const {res, next} = await runGuard(claimUnissuedCancelledGuard);

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should pass errors to next', async () => {
    const error = new Error('boom');
    mockGetClaimById.mockRejectedValueOnce(error);

    const {next} = await runGuard(claimUnissuedCancelledGuard);

    expect(next).toHaveBeenCalledWith(error);
  });
});
