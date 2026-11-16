import {Request, Response} from 'express';
import termsAndConditionsController from 'routes/features/public/termsAndConditionsController';
import {DASHBOARD_URL, TERMS_AND_CONDITIONS_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

describe('Terms and conditions page', () => {
  it('renders the terms and conditions view', async () => {
    const res = createMockResponse();

    await getRouteHandler(termsAndConditionsController, 'get', TERMS_AND_CONDITIONS_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/terms-and-conditions', {dashboardUrl: DASHBOARD_URL});
  });
});
