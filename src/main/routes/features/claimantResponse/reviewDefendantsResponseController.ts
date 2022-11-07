import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../routes/urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import {
  getFinancialDetails,
} from '../../../services/features/claimantResponse/claimantResponseService';

const reviewDefendantsResponseController = Router();

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const continueLink = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);
    const paymentDate = formatDateToFullDate(claim.paymentDate, lang);
    // TODO: to be done after CIV-5793 is completed
    const downloadResponseLink = '#';
    const financialDetails = getFinancialDetails(claim, lang);
    res.render('features/claimantResponse/review-defendants-response', {
      claim,
      continueLink,
      downloadResponseLink,
      paymentDate,
      financialDetails,
    });
  } catch (error) {
    next(error);
  }
});

export default reviewDefendantsResponseController;
