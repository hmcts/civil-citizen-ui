import * as express from 'express';
import {RepaymentPlanForm} from '../../../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {DateFormatter} from '../../../../../../common/utils/dateFormatter';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../../../services/features/response/repaymentPlan/repaymentPlanService';
import {CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, CLAIM_TASK_LIST_URL} from '../../../../../urls';
import {validateForm} from '../../../../../../common/form/validators/formValidator';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanController = express.Router();

function renderView(form: RepaymentPlanForm, res: express.Response): void {
  res.render(repaymentPlanViewPath, {form, paymentExampleDate: getFirstPaymentExampleDate()});
}

const getFirstPaymentExampleDate = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: '2-digit', year: 'numeric',
  });
};

repaymentPlanController.get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = await getRepaymentPlanForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

repaymentPlanController.post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const savedValues = await getRepaymentPlanForm(req.params.id);
      const form: RepaymentPlanForm = new RepaymentPlanForm(savedValues.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day);
      await validateForm(form);
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveRepaymentPlanData(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanController;
