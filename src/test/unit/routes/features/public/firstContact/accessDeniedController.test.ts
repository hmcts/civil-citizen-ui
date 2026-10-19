import {Request, Response} from 'express';
import accessDeniedController from 'routes/features/public/firstContact/accessDeniedController';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_REFERENCE_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('First Contact Access Denied Controller', () => {
  it('renders the access denied view', async () => {
    const res = createMockResponse();

    await getRouteHandler(accessDeniedController, 'get', FIRST_CONTACT_ACCESS_DENIED_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/firstContact/access-denied', {
      claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL,
    });
  });
});
