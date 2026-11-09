import {Request, Response} from 'express';
import signpostingController from 'routes/features/public/firstContact/signpostingController';
import {FIRST_CONTACT_CLAIM_REFERENCE_URL, FIRST_CONTACT_SIGNPOSTING_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Signposting Controller', () => {
  it('renders the signposting view', async () => {
    const res = createMockResponse();

    await getRouteHandler(signpostingController, 'get', FIRST_CONTACT_SIGNPOSTING_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/firstContact/signposting', {
      claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL,
    });
  });
});
