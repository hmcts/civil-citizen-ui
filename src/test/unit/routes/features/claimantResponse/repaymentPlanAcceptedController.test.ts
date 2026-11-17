import {Response} from 'express';
import repaymentPlanAcceptedController from 'routes/features/claimantResponse/repaymentPlanAcceptedController';
import {CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const viewPath = 'features/claimantResponse/repayment-plan-accepted';
const claimId = '12345';

describe('Claimant Response - Repayment plan accepted', () => {
  it('should return repayment plan accepted page', async () => {
    const res = createMockResponse();

    await getRouteHandler(repaymentPlanAcceptedController, 'get', CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL)(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      claimId,
      pageTitle: 'PAGES.CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED.PAGE_TITLE',
    });
  });
});
