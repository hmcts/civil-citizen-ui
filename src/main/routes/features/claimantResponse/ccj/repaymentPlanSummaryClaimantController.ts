import { NextFunction, Response, Router } from 'express';
import { AppRequest } from '../../../../common/models/AppRequest';
import { RepaymentPlanSummary } from 'common/form/models/admission/repaymentPlanSummary';
import { convertFrequencyToText, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency, getRepaymentLength } from 'common/utils/repaymentUtils';
import { CCJ_REPAYMENT_PLAN_CLAIMANT_URL } from 'routes/urls';
import { getLng } from 'common/utils/languageToggleUtils';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getClaimById } from 'modules/utilityService';
import { generateRedisKey } from '../../../../modules/draft-store/draftStoreService';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { t } from 'i18next';

const repaymentPlanSummaryClaimantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary';

function renderView(repaymentPlan: RepaymentPlanSummary, paymentOption: PaymentOptionType, paymentDate: string, title: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    paymentOption,
    paymentDate,
    title,
  });
}

repaymentPlanSummaryClaimantController.get(CCJ_REPAYMENT_PLAN_CLAIMANT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(generateRedisKey(<AppRequest>req), req);
    const title = t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN');
    const paymentIntention = claim.getPaymentIntention();
    const paymentOption = paymentIntention.paymentOption;
    const paymentDate = formatDateToFullDate(getPaymentDate(claim));
    const frequency = getRepaymentFrequency(claim);
    const repaymentPlan: RepaymentPlanSummary = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim)),
      finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim)),
      lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
    };
    renderView(repaymentPlan, paymentOption, paymentDate, title, res);
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanSummaryClaimantController;
