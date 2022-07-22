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
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {getCaseDataFromStore} from '../../../../../../modules/draft-store/draftStoreService';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanPartAdmissionController = express.Router();
let amount: number;

function renderView(form: RepaymentPlanForm, res: express.Response, amount: number): void {
  res.render(repaymentPlanViewPath, {
    form,
    paymentExampleDate: getFirstPaymentExampleDate(),
    amount,
    admission: ResponseType.PART_ADMISSION,
  });
}

repaymentPlanPartAdmissionController.get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    amount = claim.partialAdmissionPaymentAmount();
    const form = await getRepaymentPlanForm(claim);
    renderView(form, res, amount);
  } catch (error) {
    next(error);
  }
});

repaymentPlanPartAdmissionController.post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const repaymentPlan = await getRepaymentPlanForm(claim);
      const repaymentPlanForm: RepaymentPlanForm = new RepaymentPlanForm(repaymentPlan.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day);
      await validateForm(repaymentPlanForm);
      if (repaymentPlanForm.hasErrors()) {
        renderView(repaymentPlanForm, res, amount);
      } else {
        await saveRepaymentPlanData(req.params.id, repaymentPlanForm);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanPartAdmissionController;
