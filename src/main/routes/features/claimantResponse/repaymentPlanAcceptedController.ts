import {NextFunction, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL} from '../../urls';

const repaymentPlanAcceptedPath = 'features/claimantResponse/repayment-plan-accepted';
const repaymentPlanAcceptedController = Router();

repaymentPlanAcceptedController.get(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, async (req, res:Response, next: NextFunction) => {
  try {
    res.render(repaymentPlanAcceptedPath, {claimId: req.params.id, pageTitle: 'PAGES.CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED.PAGE_TITLE'});
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanAcceptedController;
