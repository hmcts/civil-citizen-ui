import {Request, Response} from 'express';
import payHearingFeeStartScreenController from '../../../../../../main/routes/features/caseProgression/hearingFee/payHearingFeeStartScreenController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseRole} from 'form/models/caseRoles';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/hearingFeeStartPageContent';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/caseProgression/hearingFee/hearingFeeStartPageContent', () => ({
  getHearingFeeStartPageContent: jest.fn(() => [{title: 'Pay hearing fee'}]),
}));

describe('Pay Hearing Fee Start Screen Controller', () => {
  const getHandler = getRouteHandler(payHearingFeeStartScreenController, 'get');
  const claimId = '1645882162449409';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (caseRole: CaseRole): Claim => {
    const claim = new Claim();
    claim.caseRole = caseRole;
    claim.totalClaimAmount = 1000;
    claim.caseProgressionHearing = {hearingFeeInformation: {hearingFee: {calculatedAmountInPence: '1000'}}} as Claim['caseProgressionHearing'];
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.restoreAllMocks();
    (getHearingFeeStartPageContent as jest.Mock).mockReturnValue([{title: 'Pay hearing fee'}]);
  });

  it('should render the start page for a claimant', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/caseProgression/hearingFee/pay-hearing-fee-start',
      expect.objectContaining({
        payHearingFeeStartScreenContent: [{title: 'Pay hearing fee'}],
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      }),
    );
  });

  it('should use the defendant dashboard URL for a defendant', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim(CaseRole.DEFENDANT));

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/caseProgression/hearingFee/pay-hearing-fee-start',
      expect.objectContaining({
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
      }),
    );
  });

  it('should pass error with status 500 to next when civil service responds with 404', async () => {
    const axiosError: {response: {status: number}; status?: number} = {response: {status: 404}};
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(axiosError);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(axiosError.status).toBe(500);
    expect(next).toHaveBeenCalledWith(axiosError);
  });
});
