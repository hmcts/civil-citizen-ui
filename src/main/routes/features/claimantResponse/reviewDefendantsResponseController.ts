import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {constructRepaymentPlanSection,getFinancialDetails} from 'services/features/claimantResponse/claimantResponseService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getDefendantsResponseContent,
} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const reviewDefendantsResponseController = Router();
const revieDefendantResponseViewPath = 'features/claimantResponse/review-defendants-response';
const howDoTheyWantToPayViewPath = 'features/claimantResponse/how-they-want-to-pay-response';

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore(claimId);
    // TODO: to be done after CIV-5793 is completed
    const downloadResponseLink = '#';
    const financialDetails = getFinancialDetails(claim, lang);
    const defendantsResponseContent = getDefendantsResponseContent(claim, getLng(lang));
    res.render(revieDefendantResponseViewPath, {
      claim,
      downloadResponseLink,
      financialDetails,
      defendantsResponseContent,
    });
  } catch (error) {
    next(error);
  }
});

reviewDefendantsResponseController.post(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const financialDetails = getFinancialDetails(claim, lang);
    const continueLink = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);
    let repaymentPlan: object;
    switch (claim?.responseStatus) {
      case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
        res.render(howDoTheyWantToPayViewPath, {
          claim,
          continueLink,
          financialDetails,
          paymentDate: formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate, lang),
        });
        break;
      case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
        repaymentPlan = constructRepaymentPlanSection(claim, getLng(lang));
        res.render(howDoTheyWantToPayViewPath, {
          claim,
          continueLink,
          financialDetails,
          repaymentPlan,
        });
        break;
      default:
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
        break;
    }
  } catch (error) {
    next(error);
  }
});
export default reviewDefendantsResponseController;
