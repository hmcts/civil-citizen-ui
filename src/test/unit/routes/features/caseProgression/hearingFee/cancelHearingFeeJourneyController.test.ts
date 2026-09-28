import {Request, Response} from 'express';
import cancelHearingFeeJourneyController from '../../../../../../main/routes/features/caseProgression/hearingFee/cancelHearingFeeJourneyController';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaim: jest.fn().mockResolvedValue(undefined),
}));

describe('Cancel hearing fee journey', () => {
  const getHandler = getRouteHandler(cancelHearingFeeJourneyController, 'get');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    jest.clearAllMocks();
  });

  it('should delete the draft claim and redirect to the claimant dashboard', async () => {
    await getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(deleteDraftClaim).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  });
});
