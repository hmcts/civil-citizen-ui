import {Request, Response} from 'express';
import contactUsController from 'routes/features/public/contactUsController';
import {CONTACT_US_URL, DASHBOARD_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

describe('Contact us page', () => {
  it('renders the contact us view', async () => {
    const res = createMockResponse();

    await getRouteHandler(contactUsController, 'get', CONTACT_US_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/contact-us', {
      dashboardUrl: DASHBOARD_URL,
      pageTitle: 'PAGES.CONTACT_US.TITLE',
    });
  });
});
