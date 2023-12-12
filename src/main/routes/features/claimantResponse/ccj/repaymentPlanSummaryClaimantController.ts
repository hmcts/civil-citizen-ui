import {NextFunction, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {RepaymentPlanSummary} from 'common/form/models/admission/repaymentPlanSummary';
import {CCJ_REPAYMENT_PLAN_CLAIMANT_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {t} from 'i18next';
import {getRepaymentInfo} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';

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
    const title = t('PAGES.REPAYMENT_PLAN_SUMMARY.REPAYMENT_PLAN');
    const paymentInfo=getRepaymentInfo(claim,lang);
    renderView(paymentInfo.repaymentPlan, paymentInfo.paymentOption, paymentInfo.paymentDate, title, res);

  } catch (error) {
    next(error);
  }
});

export default repaymentPlanSummaryClaimantController;
