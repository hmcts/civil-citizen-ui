import {Request, Response} from 'express';
import tryNewServiceController from '../../../../../../main/routes/features/public/eligibility/tryNewServiceController';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));
import {
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
} from '../../../../../../main/routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Try the new online service', () => {
  const getHandler = getRouteHandler(tryNewServiceController, 'get');
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}, session: {} as Request['session']};
    res = createMockResponse();
  });

  it('should render the try new service page', async () => {
    await getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(res.render).toHaveBeenCalledWith(
      'features/public/eligibility/try-new-service',
      expect.objectContaining({
        urlNextView: ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
        pageTitle: 'PAGES.TRY_NEW_SERVICE.PAGE_TITLE',
      }),
    );
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to bilingual preference when eligibility is complete and the user is signed in', async () => {
    req.cookies = {eligibilityCompleted: true};
    req.session = {user: {id: '123'}} as Request['session'];

    await getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(res.redirect).toHaveBeenCalledWith(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
    expect(res.render).not.toHaveBeenCalled();
  });
});
