import {NextFunction, Request, Response, Router} from 'express';
import {RepaymentPlanForm} from '../../../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../../../services/features/response/repaymentPlan/repaymentPlanService';
import {GenericForm} from '../../../../../../common/form/models/genericForm';
import {CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, CLAIM_TASK_LIST_URL} from '../../../../../urls';
import {getFirstPaymentExampleDate} from '../../fullAdmission/repaymentPlan/repaymentPlanController';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {PartAdmitGuard} from '../../../../../../routes/guards/partAdmitGuard';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanPartAdmissionController = Router();
let amount: number;

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response, amount: number): void {
  res.render(repaymentPlanViewPath, {
    form,
    paymentExampleDate: getFirstPaymentExampleDate(),
    amount,
    admission: ResponseType.PART_ADMISSION,
  });
}

repaymentPlanPartAdmissionController.get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, PartAdmitGuard.apply(CLAIM_TASK_LIST_URL),
  async (req, res, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      amount = claim.partialAdmissionPaymentAmount();
      const form = getRepaymentPlanForm(claim, true);
      renderView(new GenericForm(form), res, amount);
    } catch (error) {
      next(error);
    }
  });

repaymentPlanPartAdmissionController.post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const repaymentPlan = getRepaymentPlanForm(claim, true);
      const repaymentPlanForm: GenericForm<RepaymentPlanForm> = new GenericForm(new RepaymentPlanForm(repaymentPlan.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day));
      repaymentPlanForm.validateSync();
      if (repaymentPlanForm.hasErrors()) {
        renderView(repaymentPlanForm, res, amount);
      } else {
        await saveRepaymentPlanData(req.params.id, repaymentPlanForm.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanPartAdmissionController;
