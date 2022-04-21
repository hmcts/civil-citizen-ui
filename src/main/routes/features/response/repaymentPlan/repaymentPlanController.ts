import * as express from 'express';
import { ValidationError, Validator } from 'class-validator';
import { RepaymentPlanForm } from '../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { DateFormatter } from '../../../../common/utils/dateFormatter';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../modules/repaymentPlan/repaymentPlanService';
import {
  CITIZEN_REPAYMENT_PLAN,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanController = express.Router();

function renderView(form: RepaymentPlanForm, res: express.Response): void {
  res.render(repaymentPlanViewPath, { form, paymentExampleDate: getFirstPaymentExampleDate() });
}

const getFirstPaymentExampleDate = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: '2-digit', year: 'numeric',
  });
};

repaymentPlanController.get(CITIZEN_REPAYMENT_PLAN, async (req, res) => {
  try {
    const form = await getRepaymentPlanForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

repaymentPlanController.post(CITIZEN_REPAYMENT_PLAN,
  async (req:express.Request, res:express.Response) => {
    try {
      const savedValues = await getRepaymentPlanForm(req.params.id);
      const form: RepaymentPlanForm = new RepaymentPlanForm(savedValues.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(form);
      if (errors && errors.length > 0) {
        form.errors = errors;
        renderView(form, res);
      } else {
        await saveRepaymentPlanData(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });

export default repaymentPlanController;
