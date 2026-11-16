import {Request, Response} from 'express';
import privacyPolicyController from 'routes/features/public/privacyPolicyController';
import {DASHBOARD_URL, PRIVACY_POLICY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

describe('Privacy policy page', () => {
  it('renders the privacy policy view', async () => {
    const res = createMockResponse();

    await getRouteHandler(privacyPolicyController, 'get', PRIVACY_POLICY_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/privacy-policy', {dashboardUrl: DASHBOARD_URL});
  });
});
