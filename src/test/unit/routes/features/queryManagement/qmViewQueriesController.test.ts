import {Request, Response} from 'express';
import qmViewQueriesController from '../../../../../main/routes/features/queryManagement/qmViewQueriesController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/viewQueriesService', () => ({
  ViewQueriesService: {buildQueryListItems: jest.fn((): unknown[] => [])},
}));
jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn().mockResolvedValue({items: []}),
}));
jest.mock('modules/claimDetailsService', () => ({
  getTotalAmountWithInterestAndFees: jest.fn().mockResolvedValue(1000),
}));

describe('Query management view queries Controller', () => {
  const getHandler = getRouteHandler(qmViewQueriesController, 'get');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}, session: createMockSession({user: {id: 'user-1'}})};
    res = createMockResponse();
    next = jest.fn();
    (getNotifications as jest.Mock).mockResolvedValue({items: []});
  });

  it('should render the view queries page for a claimant', async () => {
    const claim = new Claim();
    jest.spyOn(claim, 'isClaimant').mockReturnValue(true);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(ViewQueriesService.buildQueryListItems).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith(
      'features/queryManagement/qm-view-queries-template',
      expect.objectContaining({
        claimId,
        parentQueryItems: [],
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      }),
    );
  });

  it('should use the defendant dashboard URL for a defendant', async () => {
    const claim = new Claim();
    jest.spyOn(claim, 'isClaimant').mockReturnValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/queryManagement/qm-view-queries-template',
      expect.objectContaining({
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
      }),
    );
  });

  it.each([
    {id: 'court-response', description: 'The court has responded to a message on your case.'},
    {id: 'sent-message', description: 'There has been a message sent on your case.'},
  ])('should acknowledge the $id notification when opening the query list', async ({id, description}) => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    const retrieveClaim = jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);
    const recordClick = jest.spyOn(CivilServiceClient.prototype, 'recordClick').mockResolvedValueOnce(undefined);
    recordClick.mockClear();
    (getNotifications as jest.Mock).mockResolvedValueOnce(new DashboardNotificationList([
      new DashboardNotification('unrelated-notification', '', '', 'A hearing has been scheduled.', '', '', undefined, undefined, '', ''),
      new DashboardNotification(id, '', '', description, '', '', undefined, undefined, '', ''),
    ]));

    try {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(recordClick).toHaveBeenCalledTimes(1);
      expect(recordClick).toHaveBeenCalledWith(id, req);
      expect(recordClick.mock.calls[0][1]).toBe(req);
      expect(res.render).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    } finally {
      retrieveClaim.mockRestore();
      recordClick.mockRestore();
    }
  });

  it('should call next when retrieveClaimDetails fails', async () => {
    const error = new Error('civil service down');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
