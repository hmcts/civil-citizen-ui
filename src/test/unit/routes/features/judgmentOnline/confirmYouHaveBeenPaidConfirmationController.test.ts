import {Response} from 'express';
import confirmYouHaveBeenPaidConfirmationController from 'routes/features/judgmentOnline/confirmYouHaveBeenPaidConfirmationController';
import {CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const claimId = '12345';
const viewPath = 'features/judgmentOnline/judgment-online-confirmation-page.njk';

const invoke = async () => {
  const res = createMockResponse();
  await getRouteHandler(confirmYouHaveBeenPaidConfirmationController, 'get', CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
    } as unknown as AppRequest,
    res as unknown as Response,
    jest.fn(),
  );
  return {res};
};

describe('Confirm you have been paid confirmation controller', () => {
  describe('on GET', () => {
    it('should render the confirmation page', async () => {
      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimId,
        pageTitle: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.PAGE_TITLE',
        panel: {titleText: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.YOU_CONFIRMED'},
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
        content: expect.any(Array),
      }));
    });
  });
});
