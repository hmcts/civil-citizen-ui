import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DateFormatter} from 'common/utils/dateFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from 'services/features/response/repaymentPlan/repaymentPlanService';
import {CITIZEN_REPAYMENT_PLAN_FULL_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const repaymentPlanViewPath = 'features/response/repaymentPlan/repaymentPlan';
const repaymentPlanFullAdmissionController = Router();

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response): void {
  res.render(repaymentPlanViewPath, {form, paymentExampleDate: getFirstPaymentExampleDate()});
}

export const getFirstPaymentExampleDate = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: '2-digit', year: 'numeric',
  });
};

repaymentPlanFullAdmissionController.get(CITIZEN_REPAYMENT_PLAN_FULL_URL, (async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const form = getRepaymentPlanForm(claim);
    renderView(new GenericForm(form), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

repaymentPlanFullAdmissionController.post(CITIZEN_REPAYMENT_PLAN_FULL_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getCaseDataFromStore(redisKey);
      const savedValues = getRepaymentPlanForm(claim);
      const form: GenericForm<RepaymentPlanForm> = new GenericForm(new RepaymentPlanForm(savedValues.totalClaimAmount, req.body.paymentAmount, req.body.repaymentFrequency, req.body.year, req.body.month, req.body.day));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveRepaymentPlanData(redisKey, form.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default repaymentPlanFullAdmissionController;
