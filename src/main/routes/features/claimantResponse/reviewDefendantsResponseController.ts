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
  getDefendantResponseLink,
  getDefendantsResponseContent, getResponseContentForHowTheyWantToPay,
} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import { getClaimById } from 'modules/utilityService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {noGroupingCurrencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const reviewDefendantsResponseController = Router();
const reviewDefendantResponseViewPath = 'features/claimantResponse/review-defendants-response';
const crPropertyName = 'defendantResponseViewed';
const pageParam = 'how-they-want-to-pay-response';
const pageTitle= 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAGE_TITLE';

const renderHowTheyWantPay = (req: Request, res: Response, claim: Claim) => {
  const claimId = req.params.id;
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const defendantsResponseContent = getResponseContentForHowTheyWantToPay(claim, getLng(lang));
  const financialDetails = getFinancialDetails(claim, lang);
  const continueLink = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);
  res.render('features/claimantResponse/how-they-want-to-pay-response', {
    claim,
    defendantsResponseContent,
    continueLink,
    financialDetails,
    pageTitle,
  });
};

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const downloadResponseLink = getDefendantResponseLink(claim);
    const financialDetails = getFinancialDetails(claim, lang);
    const defendantsResponseContent = getDefendantsResponseContent(claim, getLng(lang));
    const repaymentPlan = constructRepaymentPlanSection(claim, getLng(lang));
    const originalUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL) + '?page=' + pageParam;
    if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE && req.query?.page === pageParam) {
      return renderHowTheyWantPay(req, res, claim);
    }

    res.render(reviewDefendantResponseViewPath, {
      claim,
      downloadResponseLink,
      financialDetails,
      paymentDate: formatDateToFullDate(claim.partialAdmission?.paymentIntention?.paymentDate, lang),
      defendantsResponseContent,
      repaymentPlan,
      claimId,
      originalUrl,
      admittedAmount: noGroupingCurrencyFormatWithNoTrailingZeros(claim.partialAdmission?.howMuchDoYouOwe?.amount),
      pageTitle,
    });
  } catch (error) {
    next(error);
  }
});

reviewDefendantsResponseController.post(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveClaimantResponse(generateRedisKey(<AppRequest>req), true, crPropertyName);
    const claim: Claim = await getClaimById(claimId, req, true);
    if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE) {
      renderHowTheyWantPay(req, res, claim);
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default reviewDefendantsResponseController;
