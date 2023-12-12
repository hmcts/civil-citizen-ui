import { NextFunction, Response, Router } from 'express';
import { CCJ_REPAYMENT_PLAN_DEFENDANT_URL } from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { RepaymentPlanSummary } from 'common/form/models/admission/repaymentPlanSummary';
import { getPaymentDate } from 'common/utils/repaymentUtils';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getClaimById } from 'modules/utilityService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { t } from 'i18next';
import {getRepaymentPlan} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';

const repaymentPlanSummaryDefendantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary';

function renderView(repaymentPlan: RepaymentPlanSummary, paymentOption: PaymentOptionType, paymentDate: string, title: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    paymentOption,
    paymentDate,
    title,
  });
}

repaymentPlanSummaryDefendantController.get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(generateRedisKey(<AppRequest>req), req);
    const title = t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN');
    const paymentIntention = claim.getPaymentIntention();
    const paymentOption = paymentIntention.paymentOption;
    const paymentDate = formatDateToFullDate(getPaymentDate(claim));
    const repaymentPlan = getRepaymentPlan(claim, lang);
    renderView(repaymentPlan, paymentOption, paymentDate, title, res);
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanSummaryDefendantController;
