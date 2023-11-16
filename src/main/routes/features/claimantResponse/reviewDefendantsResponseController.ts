import {NextFunction, Request, Response, Router} from 'express';
import {CASE_DOCUMENT_DOWNLOAD_URL, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {DocumentType} from 'common/models/document/documentType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  constructRepaymentPlanSection,
  getFinancialDetails,
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getDefendantsResponseContent, getResponseContentForHowTheyWantToPay,
} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import { getSystemGeneratedCaseDocumentIdByType } from 'common/models/document/systemGeneratedCaseDocuments';
import { getClaimById } from 'modules/utilityService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';
import {ClaimResponseStatus} from 'models/claimResponseStatus';

const reviewDefendantsResponseController = Router();
const revieDefendantResponseViewPath = 'features/claimantResponse/review-defendants-response';
const crPropertyName = 'defendantResponseViewed';

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const downloadResponseLink = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE));
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
    await saveClaimantResponse(generateRedisKey(<AppRequest>req), true, crPropertyName);
    const claim: Claim = await getClaimById(claimId, req, true);
    if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const defendantsResponseContent = getResponseContentForHowTheyWantToPay(claim, getLng(lang));
      const financialDetails = getFinancialDetails(claim, lang);
      const continueLink = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);
      res.render('features/claimantResponse/how-they-want-to-pay-response', {
        claim,
        defendantsResponseContent,
        continueLink,
        financialDetails,
      });
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default reviewDefendantsResponseController;
