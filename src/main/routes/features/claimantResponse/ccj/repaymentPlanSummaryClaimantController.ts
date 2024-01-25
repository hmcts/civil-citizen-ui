import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {RepaymentPlanSummary} from 'common/form/models/admission/repaymentPlanSummary';
import {CCJ_REPAYMENT_PLAN_CLAIMANT_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {t} from 'i18next';
import {getRepaymentInfo} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';
import {getAmount} from 'common/utils/repaymentUtils';

const repaymentPlanSummaryClaimantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary-claimant';

function renderView(repaymentPlan: RepaymentPlanSummary, paymentOption: PaymentOptionType, paymentDate: string, amount: number, title: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    paymentOption,
    paymentDate,
    amount,
    title,
  });
}

repaymentPlanSummaryClaimantController.get(CCJ_REPAYMENT_PLAN_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const title = t('PAGES.REPAYMENT_PLAN_SUMMARY.REPAYMENT_PLAN', {lng});
    const paymentInfo = getRepaymentInfo(claim, lng);
    const amount = getAmount(claim);
    renderView(paymentInfo?.repaymentPlan, paymentInfo?.paymentOption, paymentInfo?.paymentDate, amount, title, res);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default repaymentPlanSummaryClaimantController;
