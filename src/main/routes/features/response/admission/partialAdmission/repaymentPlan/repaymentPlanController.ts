import * as express from 'express';
import {RepaymentPlanForm} from '../../../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../../../services/features/response/repaymentPlan/repaymentPlanService';
import {CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, CLAIM_TASK_LIST_URL} from '../../../../../urls';
import {validateForm} from '../../../../../../common/form/validators/formValidator';
import {getFirstPaymentExampleDate} from '../../fullAdmission/repaymentPlan/repaymentPlanController';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanPartAdmissionController = express.Router();

function renderView(form: RepaymentPlanForm, res: express.Response): void {
  res.render(repaymentPlanViewPath, {form, paymentExampleDate: getFirstPaymentExampleDate()});
}

repaymentPlanPartAdmissionController.get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = await getRepaymentPlanForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

repaymentPlanPartAdmissionController.post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const repaymentPlan = await getRepaymentPlanForm(req.params.id);
      const repaymentPlanForm: RepaymentPlanForm = new RepaymentPlanForm(repaymentPlan.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day);
      await validateForm(repaymentPlanForm);
      if (repaymentPlanForm.hasErrors()) {
        renderView(repaymentPlanForm, res);
      } else {
        await saveRepaymentPlanData(req.params.id, repaymentPlanForm);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanPartAdmissionController;
