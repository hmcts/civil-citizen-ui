import {Request, Response} from 'express';
import qmViewQueryDetailsController from '../../../../../main/routes/features/queryManagement/qmViewQueryDetailsController';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/viewQueriesService', () => ({
  ViewQueriesService: {buildQueryListItemsByQueryId: jest.fn(() => ({id: 'query-1'}))},
}));

describe('Query management view query details Controller', () => {
  const getHandler = getRouteHandler(qmViewQueryDetailsController, 'get');
  const claimId = '12345';
  const queryId = 'query-1';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId, queryId}, query: {}, cookies: {}, session: {user: {id: 'user-1'}} as Request['session']};
    res = createMockResponse();
    next = jest.fn();
  });

  it('should render query details', async () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(ViewQueriesService.buildQueryListItemsByQueryId).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith(
      'features/queryManagement/qm-view-query-details-template',
      expect.objectContaining({
        claimId,
        selectedQueryItem: {id: 'query-1'},
        isClaimOffLine: false,
      }),
    );
  });

  it('should mark the claim as offline when it is closed', async () => {
    const claim = new Claim();
    claim.ccdState = CaseState.CLOSED;
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/queryManagement/qm-view-query-details-template',
      expect.objectContaining({isClaimOffLine: true}),
    );
  });

  it('should call next when retrieveClaimDetails fails', async () => {
    const error = new Error('civil service down');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
