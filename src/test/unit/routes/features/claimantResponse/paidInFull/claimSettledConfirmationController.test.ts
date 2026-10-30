import {Response} from 'express';
import claimSettledConfirmationController from 'routes/features/claimantResponse/claimSettledConfirmationController';
import {DATE_PAID_CONFIRMATION_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

const viewPath = 'features/response/claim-settled-confirmation';

describe('Claim settled confirmation Controller', () => {
  it('should render claim settled confirmation page', async () => {
    const res = createMockResponse();

    await getRouteHandler(claimSettledConfirmationController, 'get', DATE_PAID_CONFIRMATION_URL)(
      {} as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      pageTitle: 'PAGES.SUBMIT_CONFIRMATION.PAGE_TITLE',
    });
  });
});
