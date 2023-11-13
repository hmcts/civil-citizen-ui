import { NextFunction, Response, Router } from 'express';
import { CCJ_REPAYMENT_PLAN_DEFENDANT_URL } from '../../../../routes/urls';
import { AppRequest } from '../../../../common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from '../../../../modules/draft-store/draftStoreService';
import { RepaymentPlanSummary } from 'common/form/models/admission/repaymentPlanSummary';
import { convertFrequencyToText, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency, getRepaymentLength } from 'common/utils/repaymentUtils';
import { getLng } from 'common/utils/languageToggleUtils';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { ClaimResponseStatus } from 'common/models/claimResponseStatus';

const repaymentPlanSummaryDefendantController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-summary-defendant';

function renderView(repaymentPlan: RepaymentPlanSummary, claimantResponseStatus: ClaimResponseStatus, paymentDate: string, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    repaymentPlan,
    claimantResponseStatus,
    paymentDate,
  });
}

repaymentPlanSummaryDefendantController.get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const claimantResponseStatus : ClaimResponseStatus = claim.responseStatus;
    const paymentDate = formatDateToFullDate(getPaymentDate(claim));
    const frequency = getRepaymentFrequency(claim);
    const repaymentPlan: RepaymentPlanSummary = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim)),
      finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim)),
      lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
    };
    renderView(repaymentPlan,claimantResponseStatus, paymentDate, res);
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanSummaryDefendantController;
