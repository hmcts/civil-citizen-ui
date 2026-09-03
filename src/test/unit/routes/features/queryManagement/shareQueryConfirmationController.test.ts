import {Request, Response} from 'express';
import shareQueryConfirmationController from '../../../../../main/routes/features/queryManagement/shareQueryConfirmationController';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService', () => ({
  getCancelUrl: jest.fn(() => '/dashboard'),
}));
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('Share query confirmation Controller', () => {
  const getHandler = getRouteHandler(shareQueryConfirmationController, 'get');
  const postHandler = getRouteHandler(shareQueryConfirmationController, 'post');
  const viewPath = 'features/queryManagement/qm-share-query-confirmation.njk';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}, session: {} as Request['session']};
    res = createMockResponse();
    next = jest.fn();
  });

  describe('on GET', () => {
    it('should render the share query confirmation page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(getCancelUrl).toHaveBeenCalledWith(claimId);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({claimId}));
    });
  });

  describe('on POST', () => {
    it('should re-render when confirmation is missing', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should set the session flag and redirect when confirmed', async () => {
      req.body = {confirmed: true};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(req.session.qmShareConfirmed).toBe(true);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY));
    });
  });
});
