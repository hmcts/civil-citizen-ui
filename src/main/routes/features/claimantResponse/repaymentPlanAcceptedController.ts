import {NextFunction, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const repaymentPlanAcceptedPath = 'features/claimantResponse/repayment-plan-accepted';
const repaymentPlanAcceptedController = Router();

repaymentPlanAcceptedController.get(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, async (req, res:Response, next: NextFunction) => {
  try {
    res.render(repaymentPlanAcceptedPath);
  } catch (error) {
    next(error);
  }
});

repaymentPlanAcceptedController.post(CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, async (req, res, next: NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanAcceptedController;
