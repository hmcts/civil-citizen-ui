import { NextFunction, Request, Response, Router } from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from 'services/features/response/repaymentPlan/repaymentPlanService';
import {GenericForm} from 'common/form/models/genericForm';
import {CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, RESPONSE_TASK_LIST_URL} from '../../../../../urls';
import {getFirstPaymentExampleDate} from '../../fullAdmission/repaymentPlan/repaymentPlanController';
import {ResponseType} from 'common/form/models/responseType';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {PartAdmitGuard} from 'routes/guards/partAdmitGuard';
import { PartialAdmissionRepaymentPlanForm } from 'common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan';
import {AppRequest} from 'common/models/AppRequest';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanPartAdmissionController = Router();
let amount: number;

function renderView(form: GenericForm<PartialAdmissionRepaymentPlanForm>, res: Response, amount: number): void {
  res.render(repaymentPlanViewPath, {
    form,
    paymentExampleDate: getFirstPaymentExampleDate(),
    amount,
    admission: ResponseType.PART_ADMISSION,
  });
}

repaymentPlanPartAdmissionController.get(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL),
  async (req, res, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      amount = claim.partialAdmissionPaymentAmount();
      const form = getRepaymentPlanForm(claim, true) as PartialAdmissionRepaymentPlanForm;
      renderView(new GenericForm(form), res, amount);
    } catch (error) {
      next(error);
    }
  });

repaymentPlanPartAdmissionController.post(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getCaseDataFromStore(redisKey);
      const repaymentPlan = getRepaymentPlanForm(claim, true);
      const repaymentPlanForm: GenericForm<PartialAdmissionRepaymentPlanForm> = new GenericForm(new PartialAdmissionRepaymentPlanForm(repaymentPlan.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day));
      repaymentPlanForm.validateSync();
      if (repaymentPlanForm.hasErrors()) {
        renderView(repaymentPlanForm, res, amount);
      } else {
        await saveRepaymentPlanData(redisKey, repaymentPlanForm.model, true);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default repaymentPlanPartAdmissionController;
