import { NextFunction, Response, Router } from 'express';
import { CCJ_REPAYMENT_PLAN_DEFENDANT_URL } from '../../../../routes/urls';
import { AppRequest } from '../../../../common/models/AppRequest';
import { RepaymentPlanSummary } from 'common/form/models/admission/repaymentPlanSummary';
import { convertFrequencyToText, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency, getRepaymentLength } from 'common/utils/repaymentUtils';
import { getLng } from 'common/utils/languageToggleUtils';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getClaimById } from 'modules/utilityService';
// import { generateRedisKey, getCaseDataFromStore } from '../../../../modules/draft-store/draftStoreService';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';

const repaymentPlanSummaryDefendantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary-defendant';

function renderView(repaymentPlan: RepaymentPlanSummary, paymentOption: PaymentOptionType, paymentDate: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    paymentOption,
    paymentDate,
  });
}

repaymentPlanSummaryDefendantController.get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const claim = await getClaimById(req.params.id, req);
    // const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));

    console.log(claim);
    
    const paymentIntention = claim.getPaymentIntention();
    const paymentOption = paymentIntention.paymentOption;
    // paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;

    const paymentDate = formatDateToFullDate(getPaymentDate(claim));
    const frequency = getRepaymentFrequency(claim);
    const repaymentPlan: RepaymentPlanSummary = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim)),
      finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim)),
      lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
    };
    renderView(repaymentPlan, paymentOption, paymentDate, res);
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanSummaryDefendantController;
