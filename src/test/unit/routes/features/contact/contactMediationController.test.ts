import {Response} from 'express';
import contactMediationController from 'routes/features/contact/contactMediationController';
import {CONTACT_MEDIATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const invoke = async () => {
  const res = createMockResponse();
  await getRouteHandler(contactMediationController, 'get', CONTACT_MEDIATION_URL)(
    {
      params: {},
      body: {},
      query: {},
      cookies: {},
    } as unknown as AppRequest,
    res as unknown as Response,
    jest.fn(),
  );
  return {res};
};

describe('Contact Mediation page', () => {
  describe('on GET', () => {
    it('should display Contact Mediation page', async () => {
      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith('features/public/contact-mediation', expect.objectContaining({
        pageTitle: 'Small Claims Mediation Service',
        telephone: '0300 123 4593',
      }));
    });
  });
});
