import {NextFunction, RequestHandler, Response, Router} from 'express';
import { CCJ_REPAYMENT_PLAN_DEFENDANT_URL } from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { RepaymentPlanSummary } from 'common/form/models/admission/repaymentPlanSummary';
import { getClaimById } from 'modules/utilityService';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { t } from 'i18next';
import {getRepaymentInfo} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';
import {getAmount} from 'common/utils/repaymentUtils';

const repaymentPlanSummaryDefendantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary';

function renderView(repaymentPlan: RepaymentPlanSummary, paymentOption: PaymentOptionType, paymentDate: string, amount: number, pageTitle: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    paymentOption,
    paymentDate,
    amount,
    pageTitle,
  });
}

repaymentPlanSummaryDefendantController.get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req,true);
    const pageTitle = t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN', {lng: lang});
    const paymentInfo = getRepaymentInfo(claim,lang);
    const amount = getAmount(claim);
    renderView(paymentInfo.repaymentPlan, paymentInfo.paymentOption, paymentInfo.paymentDate, amount, pageTitle, res);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default repaymentPlanSummaryDefendantController;
