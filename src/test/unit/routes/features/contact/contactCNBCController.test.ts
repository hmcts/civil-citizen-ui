import {Response} from 'express';
import contactCNBCController from 'routes/features/contact/contactCNBCController';
import {CONTACT_CNBC_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const invoke = async () => {
  const res = createMockResponse();
  await getRouteHandler(contactCNBCController, 'get', CONTACT_CNBC_URL)(
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

describe('Contact CNBC page', () => {
  describe('on GET', () => {
    it('should display Contact CNBC page', async () => {
      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith('features/public/contact-cnbc', expect.objectContaining({
        pageTitle: 'Civil National Business Centre',
      }));
    });
  });
});
