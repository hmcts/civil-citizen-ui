import * as express from 'express';
import { RepaymentPlanForm } from '../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { DateFormatter } from '../../../../common/utils/dateFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../services/features/response/repaymentPlan/repaymentPlanService';
import {
  CITIZEN_REPAYMENT_PLAN,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';


const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanController = express.Router();

function renderView(form: GenericForm<RepaymentPlanForm>, res: express.Response): void {
  res.render(repaymentPlanViewPath, { form, paymentExampleDate: getFirstPaymentExampleDate() });
}

const getFirstPaymentExampleDate = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: '2-digit', year: 'numeric',
  });
};

repaymentPlanController.get(CITIZEN_REPAYMENT_PLAN, async (req, res, next: express.NextFunction) => {
  try {
    const repaymentPlanForm = await getRepaymentPlanForm(req.params.id);
    renderView(new GenericForm(repaymentPlanForm), res);
  } catch (error) {
    next(error);
  }
});

repaymentPlanController.post(CITIZEN_REPAYMENT_PLAN,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const savedValues = await getRepaymentPlanForm(req.params.id);
      const repaymentPlanForm: GenericForm<RepaymentPlanForm> = new GenericForm(new RepaymentPlanForm(savedValues.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day));
      repaymentPlanForm.validateSync();
      if (repaymentPlanForm.hasErrors()) {
        renderView(repaymentPlanForm, res);
      } else {
        await saveRepaymentPlanData(req.params.id, repaymentPlanForm.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanController;
