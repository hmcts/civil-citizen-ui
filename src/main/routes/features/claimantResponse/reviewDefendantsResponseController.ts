import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  constructRepaymentPlanSection,
  getFinancialDetails,
  saveClaimantResponse,

} from 'services/features/claimantResponse/claimantResponseService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getDefendantsResponseContent,
} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getClaimById} from 'modules/utilityService';

const reviewDefendantsResponseController = Router();
const revieDefendantResponseViewPath = 'features/claimantResponse/review-defendants-response';
const crPropertyName = 'defendantResponseViewed';

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req);
    // TODO: to be done after CIV-5793 is completed
    const downloadResponseLink = '#';
    const financialDetails = getFinancialDetails(claim, lang);
    const defendantsResponseContent = getDefendantsResponseContent(claim, getLng(lang));
    const repaymentPlan = constructRepaymentPlanSection(claim, getLng(lang));
    res.render(revieDefendantResponseViewPath, {
      claim,
      downloadResponseLink,
      financialDetails,
      paymentDate: formatDateToFullDate(claim.partialAdmission?.paymentIntention?.paymentDate, lang),
      defendantsResponseContent,
      repaymentPlan,
      claimId,
    });
  } catch (error) {
    next(error);
  }
});

reviewDefendantsResponseController.post(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveClaimantResponse(claimId, true, crPropertyName);
    res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
  } catch (error) {
    next(error);
  }
});

export default reviewDefendantsResponseController;
