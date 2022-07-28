import * as express from 'express';
import {RepaymentPlanForm} from '../../../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {DateFormatter} from '../../../../../../common/utils/dateFormatter';
import {GenericForm} from '../../../../../../common/form/models/genericForm';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../../../services/features/response/repaymentPlan/repaymentPlanService';
import {CITIZEN_REPAYMENT_PLAN_FULL_URL, CLAIM_TASK_LIST_URL} from '../../../../../urls';
import {getCaseDataFromStore} from '../../../../../../modules/draft-store/draftStoreService';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanFullAdmissionController = express.Router();

function renderView(form: GenericForm<RepaymentPlanForm>, res: express.Response): void {
  res.render(repaymentPlanViewPath, {form, paymentExampleDate: getFirstPaymentExampleDate()});
}

export const getFirstPaymentExampleDate = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: '2-digit', year: 'numeric',
  });
};

repaymentPlanFullAdmissionController.get(CITIZEN_REPAYMENT_PLAN_FULL_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const form = getRepaymentPlanForm(claim);
    renderView(new GenericForm(form), res);
  } catch (error) {
    next(error);
  }
});

repaymentPlanFullAdmissionController.post(CITIZEN_REPAYMENT_PLAN_FULL_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const savedValues = getRepaymentPlanForm(claim);
      const form: GenericForm<RepaymentPlanForm> = new GenericForm(new RepaymentPlanForm(savedValues.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveRepaymentPlanData(req.params.id, form.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanFullAdmissionController;
